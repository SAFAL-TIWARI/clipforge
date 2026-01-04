const path = require('path');
const fs = require('fs');

const getFormats = async (ytDlp, url) => {
    try {
        const args = [
            url,
            '--dump-json',
            '--no-playlist',
            '--force-ipv4',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        console.log(`[Info] Fetching metadata for: ${url}`);
        const stdout = await ytDlp.execPromise(args);
        const metadata = JSON.parse(stdout);

        let formats = metadata.formats || [];

        // 1. Process Video
        const uniqueHeights = new Set();
        const videoOptions = [];

        // Sort by height desc
        formats.sort((a, b) => (b.height || 0) - (a.height || 0));

        for (const f of formats) {
            // Video-only streams or best streams
            if (f.vcodec !== 'none' && f.acodec === 'none' && f.height) {
                if (!uniqueHeights.has(f.height)) {
                    uniqueHeights.add(f.height);

                    videoOptions.push({
                        id: f.format_id,
                        ext: 'mp4',
                        resolution: `${f.height}p`,
                        height: f.height,
                        filesize: f.filesize,
                        note: 'High Quality',
                        original_ext: f.ext
                    });

                    videoOptions.push({
                        id: f.format_id,
                        ext: 'webm',
                        resolution: `${f.height}p`,
                        height: f.height,
                        filesize: f.filesize,
                        note: 'WebM',
                        original_ext: f.ext
                    });
                }
            }
        }

        // 2. Process Audio
        const audioFormats = formats
            .filter(f => f.vcodec === 'none' && f.acodec !== 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0));

        const seenAbr = new Set();
        const finalAudio = [];

        for (const f of audioFormats) {
            const kbps = Math.round(f.abr || 0);
            if (kbps > 0 && !seenAbr.has(kbps)) {
                seenAbr.add(kbps);

                finalAudio.push({
                    id: f.format_id,
                    ext: f.ext,
                    abr: kbps,
                    resolution: `${kbps}kbps`,
                    filesize: f.filesize,
                    note: `Original (${f.ext.toUpperCase()})`
                });

                if (f.ext !== 'mp3') {
                    finalAudio.push({
                        id: f.format_id,
                        ext: 'mp3',
                        abr: kbps,
                        resolution: `${kbps}kbps`,
                        filesize: f.filesize,
                        note: 'Converted to MP3'
                    });
                }
            }
        }

        // 3. Process Thumbnails
        const thumbnails = (metadata.thumbnails || [])
            .map(t => ({
                id: t.id,
                url: t.url,
                height: t.height,
                width: t.width,
                resolution: t.resolution || (t.height && t.width ? `${t.width}x${t.height}` : 'Unknown')
            }))
            .reverse();

        // 4. Process Subtitles
        const subtitles = [];
        const processSubs = (subsObj, isAuto) => {
            if (!subsObj) return;
            for (const [lang, formats] of Object.entries(subsObj)) {
                const name = formats[0].name || lang;
                subtitles.push({
                    lang,
                    name: `${name}${isAuto ? ' (Auto)' : ''}`,
                    isAuto,
                    formats: formats.map(f => f.ext)
                });
            }
        };

        processSubs(metadata.subtitles, false);
        processSubs(metadata.automatic_captions, true);

        return {
            title: metadata.title,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration,
            formats: {
                video: videoOptions,
                audio: finalAudio
            },
            thumbnails,
            subtitles,
            original_url: url
        };
    } catch (error) {
        throw error;
    }
};

const downloadMedia = async (ytDlp, url, options, res, ffmpegPath, tempDir) => {
    const { type, quality, format, lang, isAuto, targetUrl } = options;
    const timestamp = Date.now();

    if (type === 'thumbnail' && targetUrl) {
        try {
            const response = await fetch(targetUrl);
            if (!response.ok) throw new Error('Failed to fetch thumbnail');

            const contentType = response.headers.get('content-type');
            const buffer = await response.arrayBuffer();
            const bufferData = Buffer.from(buffer);

            res.setHeader('Content-Type', contentType || 'image/jpeg');
            // Keep as attachment to force download, user can remove 'attachment' if they want inline
            res.setHeader('Content-Disposition', `attachment; filename="thumbnail_${timestamp}.jpg"`);
            return res.send(bufferData);
        } catch (err) {
            console.error('Thumbnail download error:', err);
            return res.status(500).send('Failed to download thumbnail');
        }
    }

    let args = [url];
    let outputTemplate = path.join(tempDir, `download_${timestamp}.%(ext)s`);

    if (ffmpegPath) {
        args.push('--ffmpeg-location', ffmpegPath);
    }

    if (type === 'subtitle') {
        args.push('-o', path.join(tempDir, `sub_${timestamp}`));
        args.push('--skip-download');
        args.push('--ignore-errors');

        if (isAuto === 'true' || isAuto === true) {
            args.push('--write-auto-sub');
        } else {
            args.push('--write-sub');
        }

        args.push('--sub-lang', lang);

        // Subtitle Format Logic
        if (format === 'srt') {
            args.push('--convert-subs', 'srt');
        } else if (format === 'text') {
            // Text needs to be stripped, so we start with SRT
            args.push('--convert-subs', 'srt');
        } else if (format === 'raw') {
            // Raw should be VTT (web standard) or original. VTT is safest for "raw" display in browser.
            // If we don't convert, we might get various formats. Converting to vtt ensures consistency for "View Raw".
            args.push('--convert-subs', 'vtt');
        } else if (['vtt', 'ass', 'lrc'].includes(format)) {
            args.push('--convert-subs', format);
        }
    } else {
        args.push('-o', outputTemplate);

        if (type === 'audio') {
            args.push('-x');
            if (format === 'mp3') {
                args.push('--audio-format', 'mp3');
                args.push('--audio-quality', '0');
            } else {
                args.push('--audio-format', format);
            }
        } else {
            if (quality) {
                args.push('-f', `bestvideo[height=${quality}]+bestaudio/best[height<=${quality}]/best`);
            } else {
                args.push('-f', 'bestvideo+bestaudio/best');
            }
            if (format) {
                args.push('--merge-output-format', format);
            }
        }
    }

    console.log(`[${new Date().toISOString()}] Spawning yt-dlp: ${args.join(' ')}`);

    try {
        let eventEmitter = ytDlp.exec(args);

        if (eventEmitter.ytDlpProcess && eventEmitter.ytDlpProcess.stderr) {
            eventEmitter.ytDlpProcess.stderr.on('data', (data) => {
                const msg = data.toString();
                console.error('[yt-dlp stderr]', msg);

                if (msg.includes('HTTP Error 429') || msg.includes('Too Many Requests')) {
                    if (!res.headersSent) {
                        res.status(429).send({ error: 'YouTube Rate Limit exceeded. Please try again later.' });
                    }
                }
            });
        }

        eventEmitter.on('error', (error) => {
            console.error('yt-dlp error (ignorable if file exists):', error);
        });

        eventEmitter.on('close', (code) => {
            if (res.headersSent) return;

            if (type === 'subtitle') {
                fs.readdir(tempDir, (err, files) => {
                    if (err) {
                        if (!res.headersSent) res.status(500).send('FS Error');
                        return;
                    }
                    console.log(`[Debug] Checking dir: ${tempDir} for prefix sub_${timestamp}`);
                    const subFile = files.find(f => f.startsWith(`sub_${timestamp}`));

                    if (subFile) {
                        const fullPath = path.join(tempDir, subFile);

                        // 1. Text Format (Strip timestamps)
                        if (format === 'text') {
                            fs.readFile(fullPath, 'utf8', (err, data) => {
                                if (err) return res.status(500).send('Read Error');

                                const textContent = data
                                    .replace(/^\d+$/gm, '')
                                    .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '') // SRT
                                    .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/g, '') // VTT
                                    .replace(/WEBVTT.*/g, '')
                                    .replace(/\r\n/g, '\n')
                                    .replace(/\n\s*\n/g, '\n')
                                    .replace(/<[^>]*>/g, '')
                                    .trim();

                                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                                res.setHeader('Content-Disposition', `attachment; filename="${subFile.replace(/\.(srt|vtt|ass)/, '')}.txt"`);
                                res.send(textContent);

                                setTimeout(() => { try { fs.unlinkSync(fullPath); } catch (e) { } }, 5000);
                            });
                            return;
                        }

                        // 2. Raw Format (Inline view)
                        if (format === 'raw') {
                            fs.readFile(fullPath, 'utf8', (err, data) => {
                                if (err) return res.status(500).send('Read Error');

                                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                                res.setHeader('Content-Disposition', 'inline');
                                res.send(data);

                                setTimeout(() => { try { fs.unlinkSync(fullPath); } catch (e) { } }, 5000);
                            });
                            return;
                        }

                        // 3. Default (Download file)
                        res.download(fullPath, subFile, (err) => {
                            if (!err) {
                                setTimeout(() => { try { fs.unlinkSync(fullPath); } catch (e) { } }, 5000);
                            }
                        });
                    } else {
                        if (!res.headersSent) res.status(404).send('Subtitle file missing - check availability');
                    }
                });
            } else {
                fs.readdir(tempDir, (err, files) => {
                    if (err) {
                        if (!res.headersSent) res.status(500).send('FS Error');
                        return;
                    }
                    const downloadedFile = files.find(f => f.startsWith(`download_${timestamp}`));

                    if (downloadedFile) {
                        const fullPath = path.join(tempDir, downloadedFile);
                        const ext = path.extname(downloadedFile).toLowerCase();
                        let contentType = 'application/octet-stream';
                        if (ext === '.mp4') contentType = 'video/mp4';
                        if (ext === '.webm') contentType = 'video/webm';
                        if (ext === '.mp3') contentType = 'audio/mpeg';

                        res.setHeader('Content-Type', contentType);
                        res.download(fullPath, downloadedFile, (err) => {
                            if (!err) {
                                setTimeout(() => { try { fs.unlinkSync(fullPath); } catch (e) { } }, 5000);
                            }
                        });
                    } else {
                        if (!res.headersSent) res.status(404).send('File missing');
                    }
                });
            }
        });
    } catch (error) {
        if (!res.headersSent) res.status(500).send('Exec failed');
    }
};

module.exports = { getFormats, downloadMedia };

const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { getFormats, downloadMedia } = require('./services/downloader');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure directories exist
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// Initialize yt-dlp
const ytDlpWrap = new YTDlpWrap();
const isWindows = process.platform === 'win32';
const binaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const binaryPath = path.join(__dirname, binaryName);

// Ensure binary exists
if (!fs.existsSync(binaryPath)) {
    console.log('Downloading yt-dlp binary...');
    YTDlpWrap.downloadFromGithub(binaryPath).then(() => {
        console.log('yt-dlp downloaded.');
        ytDlpWrap.setBinaryPath(binaryPath);
    }).catch(err => console.error('Error downloading yt-dlp:', err));
} else {
    ytDlpWrap.setBinaryPath(binaryPath);
}

app.get('/', (req, res) => {
    res.send('ClipForge Backend Ready');
});

app.post('/api/info', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });
        const info = await getFormats(ytDlpWrap, url);
        res.json(info);
    } catch (error) {
        console.error('Info Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

app.get('/api/proxy-image', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send('URL required');

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).end();
    }
});

app.get('/api/download', async (req, res) => {
    try {
        const { url, format, type, quality, lang, isAuto } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // downloadMedia handles the response stream or file sending
        await downloadMedia(ytDlpWrap, url, { format, type, quality, lang, isAuto }, res, ffmpegPath, TEMP_DIR);
    } catch (error) {
        console.error('Download Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

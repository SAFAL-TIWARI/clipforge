'use client';

import React, { useState } from 'react';
import { Download, Music, Video, Film, Captions, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Format {
    id: string;
    ext: string;
    resolution?: string;
    note?: string;
    filesize?: number;
    abr?: number;
    height?: number;
    original_ext?: string;
}

interface Thumbnail {
    id: string;
    url: string;
    height: number;
    width: number;
    resolution: string;
}

interface Subtitle {
    lang: string;
    name: string;
    isAuto: boolean;
    formats: string[];
}

interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: number;
    formats: {
        video: Format[];
        audio: Format[];
    };
    thumbnails?: Thumbnail[];
    subtitles?: Subtitle[];
    original_url: string;
    language?: string; // Added language field
}

interface MediaCardProps {
    info: VideoInfo;
    onDownload: (item: any, type: 'video' | 'audio' | 'subtitle' | 'thumbnail', option?: string) => void;
    downloadingId: string | null;
}

const MediaCard: React.FC<MediaCardProps> = ({ info, onDownload, downloadingId }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'subtitle' | 'thumbnail'>('video');
    const [expandedVideoFmt, setExpandedVideoFmt] = useState<string | null>(null);
    const [expandedAudioFmt, setExpandedAudioFmt] = useState<string | null>(null);

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // Helper to group formats by extension
    const groupByExtension = (formats: Format[]) => {
        const groups: { [key: string]: Format[] } = {};
        formats.forEach(fmt => {
            const ext = (fmt.ext || 'unknown').toUpperCase();
            if (!groups[ext]) groups[ext] = [];
            groups[ext].push(fmt);
        });
        return groups;
    };

    const videoGroups = info.formats.video ? groupByExtension(info.formats.video) : {};
    const audioGroups = info.formats.audio ? groupByExtension(info.formats.audio) : {};

    const toggleVideoFormat = (fmt: string) => {
        setExpandedVideoFmt(expandedVideoFmt === fmt ? null : fmt);
    };

    const toggleAudioFormat = (fmt: string) => {
        setExpandedAudioFmt(expandedAudioFmt === fmt ? null : fmt);
    };

    // Sort subtitles: Original language first (if matches info.language), then Alphabetical
    const getSortedSubtitles = () => {
        if (!info.subtitles) return [];
        return [...info.subtitles].sort((a, b) => {
            // Check against info.language (e.g., 'en', 'fr')
            // info.language is usually a 2-char code. a.lang might be 'en', 'en-US', etc.
            const lang = info.language || '';
            const isAOriginal = a.lang === lang || a.lang.startsWith(lang + '-');
            const isBOriginal = b.lang === lang || b.lang.startsWith(lang + '-');

            if (isAOriginal && !isBOriginal) return -1;
            if (!isAOriginal && isBOriginal) return 1;

            // Secondary sort: Alphabetical by name
            return a.name.localeCompare(b.name);
        });
    };

    const sortedSubtitles = getSortedSubtitles();

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in-up">
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Thumbnail Section */}
                    {/* Changed object-cover to object-contain and added bg-black to fit 9:16 or other ratios. h-auto to adjust height based on content or min-height */}
                    <div className="md:w-1/3 relative group bg-black flex items-center justify-center min-h-[300px]">
                        <img
                            src={info.thumbnail}
                            alt={info.title}
                            className="w-full h-full object-contain max-h-[500px]"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-mono">
                            {formatDuration(info.duration)}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:w-2/3 flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{info.title}</h2>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { id: 'video', label: 'Video', icon: Video },
                                { id: 'audio', label: 'Audio', icon: Music },
                                { id: 'subtitle', label: 'Subtitles', icon: Captions },
                                { id: 'thumbnail', label: 'Thumbnails', icon: ImageIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gray-700 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Options Grid */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                            {/* VIDEO TAB */}
                            {activeTab === 'video' && (
                                <div className="space-y-4">
                                    {Object.entries(videoGroups).map(([ext, formats]) => (
                                        <div key={ext} className="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-900/30">
                                            <button
                                                onClick={() => toggleVideoFormat(ext)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                                                        <Film className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-white text-lg">{ext}</span>
                                                    <span className="text-sm text-gray-400">({formats.length} qualities)</span>
                                                </div>
                                                <span className={`transform transition-transform ${expandedVideoFmt === ext ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>

                                            {/* Dropdown Content */}
                                            {expandedVideoFmt === ext && (
                                                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 animate-fade-in-down">
                                                    {formats.map((fmt, idx) => {
                                                        const itemId = fmt.id ? `${fmt.id}-${fmt.ext}` : `video-${fmt.ext}-${fmt.resolution || idx}`;
                                                        const isThisDownloading = downloadingId === itemId;
                                                        return (
                                                            <div key={`${fmt.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-900/40 border border-gray-700/30 rounded-lg hover:border-purple-500/50 transition-all group">
                                                                <div>
                                                                    <div className="font-bold text-white text-sm">{fmt.resolution || 'Unknown'}</div>
                                                                    <div className="text-xs text-gray-400">{formatFileSize(fmt.filesize)}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => onDownload({ ...fmt, id: itemId }, 'video')}
                                                                    disabled={!!downloadingId}
                                                                    className="bg-gray-700 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isThisDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* AUDIO TAB */}
                            {activeTab === 'audio' && (
                                <div className="space-y-4">
                                    {Object.entries(audioGroups).map(([ext, formats]) => (
                                        <div key={ext} className="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-900/30">
                                            <button
                                                onClick={() => toggleAudioFormat(ext)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                                        <Music className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-white text-lg">{ext}</span>
                                                    <span className="text-sm text-gray-400">({formats.length} options)</span>
                                                </div>
                                                <span className={`transform transition-transform ${expandedAudioFmt === ext ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>

                                            {/* Dropdown Content */}
                                            {expandedAudioFmt === ext && (
                                                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 animate-fade-in-down">
                                                    {formats.map((fmt, idx) => {
                                                        const itemId = fmt.id ? `${fmt.id}-${fmt.ext}` : `audio-${fmt.ext}-${fmt.abr || idx}`;
                                                        const isThisDownloading = downloadingId === itemId;
                                                        return (
                                                            <div key={`${fmt.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-900/40 border border-gray-700/30 rounded-lg hover:border-blue-500/50 transition-all group">
                                                                <div>
                                                                    <div className="font-bold text-white text-sm">{fmt.abr ? `${Math.round(fmt.abr)}kbps` : 'Best Quality'}</div>
                                                                    <div className="text-xs text-gray-400">{formatFileSize(fmt.filesize)}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => onDownload({ ...fmt, id: itemId }, 'audio')}
                                                                    disabled={!!downloadingId}
                                                                    className="bg-gray-700 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {isThisDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SUBTITLES TAB */}
                            {activeTab === 'subtitle' && (
                                <div className="space-y-3">
                                    {(!sortedSubtitles || sortedSubtitles.length === 0) && (
                                        <div className="text-gray-400 text-center py-4">No subtitles found.</div>
                                    )}
                                    {sortedSubtitles?.map((sub, idx) => {
                                        const baseId = `subtitle-${sub.lang}`;
                                        // Highlight if it's likely the original language
                                        const isOriginal = info.language && (sub.lang === info.language || sub.lang.startsWith(info.language + '-'));

                                        return (
                                            <div key={idx} className={`flex flex-col sm:flex-row items-center justify-between p-3 border rounded-xl transition-all ${isOriginal ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-900/30 border-gray-700/50'}`}>
                                                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                                        <Captions className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2">
                                                            {sub.name}
                                                            {isOriginal && <span className="text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">Original</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-400 uppercase">{sub.lang}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onDownload({ ...sub, id: `${baseId}-text` }, 'subtitle', 'text')}
                                                        disabled={!!downloadingId}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingId === `${baseId}-text` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Download className="w-3 h-3" /> Text</>}
                                                    </button>
                                                    <button
                                                        onClick={() => onDownload({ ...sub, id: `${baseId}-srt` }, 'subtitle', 'srt')}
                                                        disabled={!!downloadingId}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingId === `${baseId}-srt` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Download className="w-3 h-3" /> SRT</>}
                                                    </button>
                                                    <button
                                                        onClick={() => onDownload({ ...sub, id: `${baseId}-raw` }, 'subtitle', 'raw')}
                                                        disabled={!!downloadingId}
                                                        className="px-3 py-1.5 bg-gray-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingId === `${baseId}-raw` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Download className="w-3 h-3" /> Raw</>}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* THUMBNAILS TAB */}
                            {activeTab === 'thumbnail' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {info.thumbnails?.map((thumb, idx) => {
                                        const itemId = thumb.id || `thumb-${idx}`;
                                        const isThisDownloading = downloadingId === itemId;
                                        return (
                                            <div key={idx} className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500 transition-all">
                                                <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
                                                    <img src={thumb.url} alt={`Thumbnail ${thumb.resolution}`} loading="lazy" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                    <span className="text-white text-sm font-bold">{thumb.resolution}</span>
                                                    <button
                                                        onClick={() => onDownload({ ...thumb, id: itemId }, 'thumbnail')}
                                                        disabled={!!downloadingId}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isThisDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Download className="w-3 h-3" /> PNG</>}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaCard;

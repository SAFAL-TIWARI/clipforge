'use client';

import React, { useState } from 'react';
import URLInput from '../components/URLInput';
import MediaCard from '../components/MediaCard';
import { Sparkles } from 'lucide-react';

import { motion } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // ... (handlers remain) ...
  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setLoadingMessage('Fetching video info...');
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`${API_URL}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch video info');
      }

      setLoadingMessage('Parsing formats...');
      const data = await response.json();
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownload = async (item: any, type: 'video' | 'audio' | 'subtitle' | 'thumbnail', option?: string) => {
    // Unique ID for the spinner
    const itemId = item.id || `${type}-${option || 'default'}-${item.lang || ''}`;
    setDownloadingId(itemId);

    // Construct GET URL for download
    const baseUrl = `${API_URL}/api/download`;
    const params = new URLSearchParams();

    params.append('url', videoInfo.original_url);
    params.append('type', type);

    if (type === 'video') {
      params.append('format', item.original_ext || 'mp4'); // Default or specific
      params.append('quality', item.height.toString());
    } else if (type === 'audio') {
      params.append('format', item.ext || 'mp3');
    } else if (type === 'subtitle') {
      params.append('format', option || 'srt');
      params.append('lang', item.lang);
      params.append('isAuto', item.isAuto.toString());
    } else if (type === 'thumbnail') {
      params.append('targetUrl', item.url);
    }

    const downloadUrl = `${baseUrl}?${params.toString()}`;

    // Feature: Open RAW subtitles in a new tab (inline view)
    if (type === 'subtitle' && option === 'raw') {
      window.open(downloadUrl, '_blank');
      setDownloadingId(null);
      return;
    }

    // Feature: Download others generally with spinner tracking
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      // Fallback filename if header is missing
      if (filename === 'download') {
        if (type === 'video') filename = `video.${item.ext || 'mp4'}`;
        else if (type === 'audio') filename = `audio.${item.ext || 'mp3'}`;
        else if (type === 'subtitle') filename = `subtitle.${option || 'srt'}`;
        else if (type === 'thumbnail') filename = `thumbnail.png`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-30 px-4 relative overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-4 hover:bg-white/10 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Support for YouTube, Instagram, & more</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tight leading-snug">
            ClipForge
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Download high-quality videos, audio, and many more things directly from your favorite platforms. Simple, fast, and free.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full mt-8"
        >
          <URLInput onSubmit={handleUrlSubmit} isLoading={isLoading} loadingMessage={loadingMessage} />
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        {/* Result Section */}
        {videoInfo && !isLoading && (
          <MediaCard
            info={videoInfo}
            onDownload={handleDownload}
            downloadingId={downloadingId}
          />
        )}
      </div>
    </motion.main>
  );
}

'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface URLInputProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
    loadingMessage?: string;
}

const URLInput: React.FC<URLInputProps> = ({ onSubmit, isLoading, loadingMessage }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        // Basic web url regex or let backend handle it?
        // Let's do loose validation
        if (!url.startsWith('http')) {
            setError('URL must start with http:// or https://');
            return;
        }

        onSubmit(url);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste URL from YouTube, Instagram, Twitter..."
                    className="w-full py-4 pl-12 pr-32 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-xl"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {loadingMessage && <span className="text-xs whitespace-nowrap">{loadingMessage}</span>}
                        </div>
                    ) : (
                        'Start'
                    )}
                </button>
            </form>
            {error && <p className="text-red-400 mt-2 text-sm ml-2">{error}</p>}
        </div>
    );
};

export default URLInput;

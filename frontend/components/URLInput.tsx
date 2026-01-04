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
                <div className="absolute inset-y-0 left-0 pl-4 z-10 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-5 h-5 z-10" />
                </div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste URL of any social media platform.."
                    className="w-full py-5 pl-12 pr-55 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur-sm shadow-xl hover:bg-gray-800/70"
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-2 bottom-2 font-medium">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-full px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
            </form>
            {error && <p className="text-red-400 mt-2 text-sm ml-2">{error}</p>}
        </div>
    );
};

export default URLInput;

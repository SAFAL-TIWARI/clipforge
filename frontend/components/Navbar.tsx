'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <div className="flex justify-center w-full fixed top-4 z-50 px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="pointer-events-auto flex items-center justify-between px-6 py-3 w-full max-w-4xl bg-background/10 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <Link href="/" className="font-bold text-xl tracking-tight relative group">
                        <span className="relative z-10">ClipForge</span>
                        {/* <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all group-hover:w-full"></span> */}
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    {["Video downloader", "Image downloader", "Format converter", "Tools"].map((item) => (
                        <Link href="#" key={item} className="relative hover:text-foreground transition-colors group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                <div className="md:hidden">
                    {/* Mobile menu placeholder - can be expanded later */}
                    <button className="p-2 text-neutral-600 dark:text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;

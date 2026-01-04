# ClipForge

**ClipForge** is a professional, high-performance media downloader and converter built with a modern tech stack. It allows users to download videos, audio, subtitles, and thumbnails from a wide range of platforms with ease.

<a href="https://clipforge-gamma.vercel.app/" target="_blank"><strong>🌐 Live Demo</strong></a>

## 🚀 Features

-   **Universal Video Downloader**: Support for 1000+ websites (powered by `yt-dlp`), including YouTube, Vimeo, Dailymotion, and more.
-   **Multi-Format Support**: Download in various resolutions (up to 4K) and formats (MP4, WebM, MP3).
-   **Subtitle Extraction**: Download subtitles in multiple languages and formats (SRT, TXT, Raw).
-   **Thumbnail Saver**: View and download high-quality video thumbnails.
-   **Modern UI/UX**: A sleek, responsive interface built with Next.js and Tailwind CSS, featuring smooth animations.
-   **Fast & Secure**: Direct downloads with no account required.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: <a href="https://nextjs.org/" target="_blank">Next.js 16</a> (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Icons**: Lucide React

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Core Engine**: <a href="https://github.com/yt-dlp/yt-dlp" target="_blank">yt-dlp</a> (via `yt-dlp-wrap`)
-   **Media Processing**: FFmpeg (via `ffmpeg-static` & `fluent-ffmpeg`)

## 📦 Installation

To get a local copy up and running, follow these simple steps.

### 1. Clone the Repository
```bash
git clone https://github.com/SAFAL-TIWARI/clipforge.git
cd clipforge
```

### 2. Setup Backend
The backend handles the core downloading logic.

```bash
cd backend
npm install
npm run dev
```
*Note: The backend will automatically download the necessary `yt-dlp` binary on the first run.*
*Server runs on: `http://localhost:5000`*

### 3. Setup Frontend
The frontend provides the user interface. open a new terminal for this.

```bash
cd frontend
npm install
npm run dev
```
*App runs on: `http://localhost:3000`*

## 📖 Usage

1.  Open the frontend application (usually `http://localhost:3000`).
2.  Paste a video URL into the input field.
3.  Click **"Paste"** or **"Search"**.
4.  Select your desired format (Video, Audio) and quality.
5.  Click **Download** to save the file to your device.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

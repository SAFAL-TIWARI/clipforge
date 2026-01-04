# Use Node.js 18 (full image, not slim) to ensure all networking/certs libs are present
FROM node:18

# Install system dependencies
# ffmpeg: required for media processing
# python3: often required by yt-dlp related tools
# curl: for downloading yt-dlp
RUN apt-get update && \
    apt-get install -y ffmpeg python3 ca-certificates curl procps && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies  
RUN npm install

# Copy source code
COPY . .

# Create necessary directories with permissions
RUN mkdir -p downloads temp && \
    chmod 777 downloads temp

# Hugging Face Spaces server runs on port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start the application
CMD ["node", "server.js"]

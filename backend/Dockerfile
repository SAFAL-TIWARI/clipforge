# Use Node.js 18 on Debian (slim) which is compatible with most binaries
FROM node:18-slim

# Install system dependencies
# ffmpeg: required for media processing
# python3: often required by yt-dlp related tools
RUN apt-get update && \
    apt-get install -y ffmpeg python3 ca-certificates procps && \
    rm -rf /var/lib/apt/lists/*

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

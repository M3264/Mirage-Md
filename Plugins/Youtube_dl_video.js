const fs = require('fs');
const ytdl = require('ytdl-core');
const { youtube } = require('scrape-youtube');

// Function to extract video ID from URL
function getVideoIdFromUrl(link) {
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|watch\?v=))([\w-]{11})/);
    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('Invalid YouTube URL');
    }
}

// Sanitize filename by replacing invalid characters
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
}

module.exports = {
    usage: ['yt', 'ytvideo', 'videoyt', 'youtube'],
    description: 'Download Video/Audio from YouTube',
    emoji: '🎬',
    commandType: 'Download',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download video/audio, send ".yt [YouTube URL]" ' }, { quoted: m });
                return;
            }

            const input = args.join(' ');
            let videoID;
            await sock.sendMessage(m.key.remoteJid, { react: { text: '🔎', key: m.key } }); // React with search emoji

            // Determine if the input is a valid YouTube URL or search term
            if (input.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|watch\?v=))([\w-]{11})/)) {
                videoID = getVideoIdFromUrl(input);
            } else {
                const options = {
                    type: 'video',
                    request: {
                        headers: {
                            Cookie: 'PREF=f2=8000000',
                            'Accept-Language': 'en'
                        }
                    }
                };
                const { videos } = await youtube.search(input, options);
                if (videos.length === 0) {
                    throw new Error('No videos found for the given keyword.');
                }
                videoID = getVideoIdFromUrl(videos[0].link);
            }

            const MAX_DOWNLOAD_SIZE = settings.maxDownloadSize;
            const videoInfo = await ytdl.getInfo(videoID);

            // Choose the highest quality video format available
            const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highest' });

            // Check if video size exceeds maximum allowed
            const videoSizeMB = videoFormat.contentLength ? (videoFormat.contentLength / (1024 * 1024)).toFixed(2) : 'Unknown';
            if (videoSizeMB > MAX_DOWNLOAD_SIZE) {
                await sock.sendMessage(m.key.remoteJid, { text: `The video size (${videoSizeMB} MB) exceeds the maximum download size (${MAX_DOWNLOAD_SIZE} MB).` }, { quoted: m });
                return;
            }

            const videoStream = ytdl(videoInfo.videoDetails.video_url, { format: videoFormat });
            await sock.sendMessage(m.key.remoteJid, { react: { text: '⬇️', key: m.key } }); // React with download emoji

            // Sanitize the video title for use as the file name
            const sanitizedFileName = sanitizeFilename(videoInfo.videoDetails.title);
            const filePath = `./temp/${sanitizedFileName}.${videoFormat.container}`;

            // Ensure the temporary directory exists
            const tempDirPath = './temp';
            if (!fs.existsSync(tempDirPath)) {
                fs.mkdirSync(tempDirPath);
            }

            // Create a writable stream to save the video file
            const writeStream = fs.createWriteStream(filePath);
            videoStream.pipe(writeStream);

            // Handle completion and send the video file
            writeStream.on('finish', async () => {
                const botName = settings.botName;
                const videoFilePath = `./temp/${sanitizedFileName}.${videoFormat.container}`;

const message = `
╭┉┉┅┄┄┈•◦ೋ•◦🦋•◦ೋ•┈┄┄┅┉┉╮
💖 Welcome to ${botName} YT Downloader! 💖
╰┉┉┅┄┄┈•◦ೋ•◦🦋•◦ೋ•┈┄┄┅┉┉╯
                
✨ Your video is ready ✨
                
*️⃣ *Title:* ${videoInfo.videoDetails.title}
 ⏳ *Duration:* ${videoInfo.videoDetails.lengthSeconds} seconds
🔗 *URL:* ${videoInfo.videoDetails.video_url}
🎥 *Channel:* ${videoInfo.videoDetails.ownerChannelName}
👁️ *Views:* ${videoInfo.videoDetails.viewCount.toLocaleString()}
🗓️ *Published:* ${videoInfo.videoDetails.uploadDate}
✨ *Category:* ${videoInfo.videoDetails.category}
💾 *Size:* ${videoSizeMB} MB
                
 💐 Thank you for using ${botName}! 💐
`;
                

                await sock.sendMessage(m.key.remoteJid, {
                    document: fs.readFileSync(videoFilePath),
                    mimetype: `video/${videoFormat.container}`,
                    fileName: `${sanitizedFileName}.${videoFormat.container}`,
                    caption: `${message}\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                }, { quoted: m });

                // Delete the temporary video file after sending
                fs.unlinkSync(videoFilePath);
                await sock.sendMessage(m.key.remoteJid, { react: { text: '✅', key: m.key } }); // React with success emoji
            });

            // Handle errors during file write
            writeStream.on('error', async (err) => {
                console.error('Error writing video file:', err);
                await sock.sendMessage(m.key.remoteJid, { text: err.message || 'An error occurred while processing your request.' }, { quoted: m });
            });

        } catch (error) {
            console.error('Error occurred:', error);
            await sock.sendMessage(m.key.remoteJid, { text: error.message || 'An error occurred while processing your request.' }, { quoted: m });
        }
    }
};

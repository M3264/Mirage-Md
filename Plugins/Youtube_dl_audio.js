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
    usage: ['ytaudio', 'ytmp3', 'play', 'song'],
    description: 'Download audio from a YouTube video',
    emoji: '🎶',
    commandType: 'Download',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const OriginalText = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            const [command, ...args] = OriginalText.split(' ');

            if (args.length < 1) {
                await sock.sendMessage(m.key.remoteJid, { text: 'Hey there! To download audio, send ".ytaudio [YouTube URL]" ' }, { quoted: m });
                return;
            }

            const input = args.join(' ');
            let videoID;
            await sock.sendMessage(m.key.remoteJid, { react: { text: '🔎', key: m.key } }); // Error reaction
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
                const { videos } = await youtube.search('song' + input, options);
                if (videos.length === 0) {
                    throw new Error('No videos found for the given keyword.');
                }
                videoID = getVideoIdFromUrl(videos[0].link);
            }

            const MAX_DOWNLOAD_SIZE = settings.maxDownloadSize
            const videoInfo = await ytdl.getInfo(videoID);
            const { title, description, lengthSeconds, video_url, ownerChannelName, viewCount, uploadDate, category, keywords } = videoInfo.videoDetails;
            const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
            const audioSizeMB = videoFormat.contentLength ? (videoFormat.contentLength / (1024 * 1024)).toFixed(2) : 'Unknown';
            if (audioSizeMB > MAX_DOWNLOAD_SIZE) {
                await sock.sendMessage(m.key.remoteJid, { text: `The audio size (${audioSizeMB} MB) exceeds the maximum download size (${MAX_DOWNLOAD_SIZE} MB).` }, { quoted: m });
                return;
            }
            const audioStream = ytdl(video_url, { format: videoFormat });
            await sock.sendMessage(m.key.remoteJid, { react: { text: '⬇️', key: m.key } }); // Error reaction
            const sanitizedFileName = sanitizeFilename(title); // Sanitize the title for use as the file name
            const filePath = `./temp/${sanitizedFileName}.mp3`;
            const tempDirPath = './temp';
            if (!fs.existsSync(tempDirPath)) {
                fs.mkdirSync(tempDirPath);
            }
            const writeStream = fs.createWriteStream(filePath);

            audioStream.pipe(writeStream);

            writeStream.on('finish', async () => {
                const botName = settings.botName;
                const audioFilePath = `./temp/${sanitizedFileName}.mp3`; // Ensure this matches the writeStream path

                const message = `
-------✧*̥˚ ${botName} YT DOWNLOADER*̥˚✧

🏷️ *Title*: ${title}
📝 *Description*: ${description}
⏳ *Length*: ${lengthSeconds} seconds
🔗 *URL*: ${video_url}
📺 *Channel*: ${ownerChannelName}
👀 *View Count*: ${viewCount}
📅 *Upload Date*: ${uploadDate}
📚 *Category*: ${category}
💽 *Audio Size*: ${videoFormat.contentLength ? (videoFormat.contentLength / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}
`;
                await sock.sendMessage(m.key.remoteJid, { react: { text: '⬆️', key: m.key } }); // Error reaction
                // Check if file exists before sending
                if (fs.existsSync(audioFilePath)) {
                    await sock.sendMessage(
                        m.key.remoteJid,
                        {
                            document: fs.readFileSync(audioFilePath),
                            mimetype: 'audio/mpeg',
                            fileName: `${sanitizedFileName}.mp3`,
                            caption: `${message}\n\n𝘏𝘈𝘊𝘟𝘒 𝘔𝘋`
                        },
                        { quoted: m }
                    );
                    fs.unlinkSync(audioFilePath);
                    await sock.sendMessage(m.key.remoteJid, { react: { text: '✅', key: m.key } }); // Error reaction
                } else {
                    throw new Error('File not found or could not be read.');
                }
            });

            writeStream.on('error', async (err) => {
                console.error('Error writing audio file:', err);
                await sock.sendMessage(m.key.remoteJid, { text: err.message || 'An error occurred while processing your request.' }, { quoted: m });
            });

        } catch (error) {
            console.error('Error occurred:', error);
            await sock.sendMessage(m.key.remoteJid, { text: error.message || 'An error occurred while processing your request.' }, { quoted: m });
        }
    }
};

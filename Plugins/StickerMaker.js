const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

module.exports = {
    usage: ['sticker', 's', 'stickergif'],
    description: 'Create a sticker or GIF from an image or video',
    emoji: '✨',
    commandType: 'Media',
    isWorkAll: true,
    async execute(sock, m, args) {
        const { message: { imageMessage, videoMessage, extendedTextMessage, conversation }, key: { remoteJid, fromMe, id } } = m;
        console.log(imageMessage, '-------------------------------------------------------------', videoMessage);
        const quotedMessage = extendedTextMessage?.contextInfo?.quotedMessage.imageMessage || conversation?.contextInfo?.quotedMessage.videoMessage || imageMessage || videoMessage;
        if (!quotedMessage && imageMessage && videoMessage) {
            return sock.sendMessage(remoteJid, { text: '⚠️ Please reply to an image or video to create a sticker.' }, { quoted: m });
        }

        const mime = quotedMessage.mimetype;
        const isAnimated = mime.startsWith('video/');
        const allowedMimeTypes = isAnimated ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png'];

        if (!allowedMimeTypes.includes(mime)) {
            return sock.sendMessage(remoteJid, { text: '⚠️ Unsupported file type. Please use a JPEG, PNG, MP4, or WebM.' }, { quoted: m });
        }

        try {
            const stream = await downloadContentFromMessage(imageMessage ? imageMessage : videoMessage, isAnimated ? 'video' : 'image');
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            const tempFilePath = path.join(tempDir, `temp.${isAnimated ? 'mp4' : 'jpeg'}`);
            const writeStream = fs.createWriteStream(tempFilePath);

            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();

            writeStream.on('finish', async () => {
                // Check file size
                const fileSizeInBytes = fs.statSync(tempFilePath).size;
                const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

                if (fileSizeInBytes > maxSizeInBytes) {
                    fs.unlinkSync(tempFilePath);
                    return sock.sendMessage(remoteJid, { text: '⚠️ The file is too large. Please use a file smaller than 10 MB.' }, { quoted: m });
                }

                const outputSticker = path.join(tempDir, `sticker.${isAnimated ? 'webp' : 'webp'}`);
                const ffmpegCommand = isAnimated ?
                    ffmpeg(tempFilePath)
                        .inputOptions(['-t 10', '-an'])
                        .complexFilter(['fps=10', 'scale=512:512:flags=lanczos', 'split [a][b]', '[a] palettegen [p]', '[b][p] paletteuse'])
                        .toFormat('webp')
                        .outputOptions(['-loop 0', '-preset default'])
                        .save(outputSticker) :
                    ffmpeg(tempFilePath)
                        .inputOptions(['-t 10', '-an'])
                        .complexFilter(['fps=10', 'scale=512:512:flags=lanczos'])
                        .toFormat('webp')
                        .outputOptions(['-loop 0', '-preset default'])
                        .save(outputSticker);

                ffmpegCommand.on('end', async () => {
                    const stickerData = fs.readFileSync(outputSticker);
                    await sock.sendMessage(remoteJid, { sticker: stickerData }, { quoted: m });

                    fs.unlinkSync(tempFilePath);
                    fs.unlinkSync(outputSticker);
                });

                ffmpegCommand.on('error', (err) => {
                    console.error('Error creating sticker:', err);
                    sock.sendMessage(remoteJid, { text: '⚠️ An error occurred while creating the sticker. Please try again later.' }, { quoted: m });
                    fs.unlinkSync(tempFilePath);
                });
            });
        } catch (error) {
            console.error('Error creating sticker:', error);
            return sock.sendMessage(remoteJid, { text: '⚠️ An error occurred while creating the sticker. Please try again later.' }, { quoted: m });
        }
    }
};

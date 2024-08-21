const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker } = require('wa-sticker-formatter');
const fs = require('fs');
const path = require('path');

module.exports = {
    usage: ['sticker2', 's2', 'stickergif2'],
    description: 'Create a sticker or GIF from an image or video',
    emoji: '✨',
    commandType: 'Media',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const msg = m.message
            const media = msg?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                msg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                msg?.videoMessage || msg.imageMessage;

            console.log("Mediiaa", media)

            if (!media?.mimetype) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `*To create a sticker, upload an image with /sticker in the caption or tag the message containing an image.*`
                }, { quoted: m });
            }

            if (media.mimetype !== 'image/jpeg') {
                return;
            }

            try {
                const imgbuff = await getFileBuffer(media, 'image');

                const newSticker = new Sticker(imgbuff, {
                    pack: 'Mirage bot md',
                    author: 'Mirage',
                    type: 'full',
                    background: '#000000',
                    quality: 70
                });

                return await sock.sendMessage(m.key.remoteJid, {
                    sticker: await newSticker.toBuffer()
                }, { quoted: m });
            } catch (error) {
                console.error('Error creating sticker:', error);
                return await sock.sendMessage(m.key.remoteJid, {
                    text: "❌ An error occurred while creating the sticker."
                }, { quoted: m });
            }
        } catch (error) {
            console.error("Error in sticker command:", error);
        }
    }
}


async function getFileBuffer(mediakey, mediaType) {
    const stream = await downloadContentFromMessage(mediakey, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

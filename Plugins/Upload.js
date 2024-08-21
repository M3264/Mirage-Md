const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const crypto = require('crypto');

const baseURL = 'https://filebin.net'; // Replace with your Filebin API base URL

async function uploadFileToBin(binName, fileName, filePath, customClientId = '') {
    const url = `${baseURL}/${binName}/${fileName}`;

    const form = new FormData();
    form.append('file', fs.readFileSync(filePath), { filename: fileName }); // Read the file as a buffer
    form.append('cid', customClientId || crypto.randomBytes(4).toString('hex')); // Generate a random 8-character string if customClientId is not provided

    try {
        let headers = {
            ...form.getHeaders(),
            'Content-Type': 'application/octet-stream',
            'accept': 'application/json',
        };

        try {
            let response = await axios.post(url, form, { headers });
            console.log(response.data)
            return response.data; // Assuming the API returns some useful data upon successful upload
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        throw new Error(`Error uploading file to bin: ${error.message}`);
    }
}

// Example usage in your command execution function
module.exports = {
    usage: ['upload'],
    description: 'Uploads a file to a temporary hosting service and returns a shareable link.',
    emoji: '📂',
    commandType: 'Upload',
    isWorkAll: true,

    async execute(sock, m) {
        let mess;
        let media;
        let mimeType;
        let ty;

        // Check for quotedMessage (mentionedJid is handled internally in some libraries)
        for (const key of Object.keys(m.message)) {
            if (m.message[key]?.contextInfo?.quotedMessage) {
                mess = m.message[key].contextInfo.quotedMessage;

                // Determine the type of media file if present
                if (mess.imageMessage) {
                    media = mess.imageMessage;
                    mimeType = 'image/jpeg'; // Assuming JPEG for images (can be adjusted)
                } else if (mess.videoMessage) {
                    media = mess.videoMessage;
                    mimeType = media.mimetype; // Get actual mime type for video
                } else if (mess.audioMessage) {
                    media = mess.audioMessage;
                    mimeType = media.mimetype;
                } else if (mess.documentMessage) {
                    media = mess.documentMessage;
                    mimeType = media.mimetype;
                } else if (mess.stickerMessage) {
                    media = mess.stickerMessage;
                    mimeType = 'image/webp'; // Stickers are often WebP format
                } else if (mess.contactMessage) {
                    media = mess.contactMessage;
                    mimeType = 'text/plain'; // Contact messages typically plain text
                } else if (mess.locationMessage) {
                    media = mess.locationMessage;
                    mimeType = 'application/json'; // Location messages could be JSON
                } else if (mess.liveLocationMessage) {
                    media = mess.liveLocationMessage;
                    mimeType = 'application/json'; // Live location JSON
                } else if (mess.documentWithCaptionMessage) {
                    media = mess.documentWithCaptionMessage.message.documentMessage;
                    mimeType = media.mimetype;
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: "Please provide a valid file!" }, { quoted: m });
                }

                // Check for different MIME types including APK file
                switch (mimeType) {
                    case 'application/vnd.android.package-archive':
                        mimeType = 'apk';
                        ty = '.apk'
                        console.log('APK file detected');
                        break;
                    case 'image/jpeg':
                        mimeType = 'image';
                        ty = '.jpg'
                        console.log('Image file detected');
                        break;
                    case 'image/png':
                        mimeType = 'image';
                        ty = '.png'
                        console.log('Image file detected');
                        break;
                    case 'image/gif':
                        mimeType = 'image';
                        ty = '.gif'
                        console.log('Image file detected');
                        break;
                    case 'image/bmp':
                    case 'ppic':
                    case 'product':
                    case 'thumbnail-image':
                    case 'thumbnail-link':
                    case 'product-catalog-image':
                    case 'payment-bg-image':
                        mimeType = 'image';
                        ty = '.jpg'
                        console.log('Image file detected');
                        break;
                    case 'video/mp4':
                    case 'video/quicktime':
                    case 'video/x-msvideo':
                    case 'thumbnail-video':
                    case 'ptv':
                        mimeType = 'video';
                        ty = '.mp4'
                        console.log('Video file detected');
                        break;
                    case 'audio/mpeg':
                    case 'audio/aac':
                    case 'audio/wav':
                    case 'ptt':
                        mimeType = 'audio';
                        ty = '.mp3'
                        console.log('Audio file detected');
                        break;
                    case 'image/gif':
                        mimeType = 'gif';
                        ty = '.gif'
                        console.log('GIF file detected');
                        break;
                    case 'text/plain':
                    case 'application/octet-stream':
                    case 'md-app-state':
                    case 'md-msg-hist':
                    case 'document':
                    case 'thumbnail-document':
                        mimeType = 'text';
                        ty = '.txt'
                        console.log('Text file or generic binary file detected');
                        break;
                    case 'application/json':
                        mimeType = 'json';
                        ty = '.json'
                        console.log('JSON file detected');
                        break;
                    case 'application/xml':
                    case 'text/xml':
                        ty = '.xml'
                        console.log('XML file detected');
                        break;
                    case 'application/msword':
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                        console.log('Word document detected');
                        break;
                    case 'application/vnd.ms-excel':
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                        console.log('Excel spreadsheet detected');
                        break;
                    case 'application/vnd.ms-powerpoint':
                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                        console.log('PowerPoint presentation detected');
                        break;
                    default:
                        console.log('Unsupported file type detected');
                }

                break; // Exit the loop once a quoted message is found
            }
        }
        await sock.sendMessage(m.key.remoteJid, { text: "Warning This upload Will Corrupt your file sometime!" }, { quoted: m });
        // Check if the message contains a document to upload
        if (!mess) {
            await sock.sendMessage(m.key.remoteJid, { text: "Please reply to the file you want to upload to cloud!." }, { quoted: m });
            return;
        }
        let filePathFinall;

        try {
            // Extract document information from the quoted message
            const document = mess;
            const fileName = document.filename || 'file';
            const fileId = document.fileSha256 || document.fileEncSha256 || '';

            // Download the file from WhatsApp using the quoted message
            const mediaData = await downloadContentFromMessage(media, mimeType);

            // Check if mediaData is a stream (Transform), convert to buffer if necessary
            let mediaDataBuffer;
            if (mediaData instanceof Buffer) {
                mediaDataBuffer = mediaData;
            } else {
                // Read from the stream and accumulate into a buffer
                mediaDataBuffer = await streamToBuffer(mediaData);
            }

            // Write the file to a temporary location
            const filePath = path.join('./temp', fileName);
            filePathFinall = filePath
            fs.writeFileSync(filePath, mediaDataBuffer);

            // Prepare the file for upload to Filebin
            const uploadedFile = await uploadFileToBin('w5y76baegcues6k1dsds', 'fadf3wf4343fv34f' + fileName + ty, filePath, 'customClient123');

            // Handle response from Filebin upload
            if (uploadedFile) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `✅ File uploaded successfully to Filebin!\n\nDownload Link:\n https://filebin.net/${uploadedFile.bin.id}/${uploadedFile.file.filename}`
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: '❌ Upload failed. Please try again.' }, { quoted: m });
            }
        } catch (error) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ An error occurred during upload. Please try again.' }, { quoted: m });
            console.error('Upload Error:', error); // Log any errors
        } finally {
            // Cleanup: Delete the temporary file after upload or in case of error
            if (filePathFinall && fs.existsSync(filePathFinall)) {
                fs.unlinkSync(filePathFinall);
            }
        }
    }
};

// Helper function to convert a stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}

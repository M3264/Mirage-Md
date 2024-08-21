const axios = require('axios');
const download = require('download');
const fs = require('fs');
const path = require('path');
const { HacxK } = require('../Lib/EventsHandle/EventsHandle');

const sanitize = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_]/g, '_'); // Replace invalid characters with an underscore
};


module.exports = {
    usage: ['apk', 'apkdl'],
    description: 'Download an APK file using a query',
    emoji: '📥',
    commandType: 'Download',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const query = args.join(' ');
            if (!query) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `
╭• ─────────── ✾ ─────────── •╮
┊ 📥  APK Download  📥
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *Usage:* /apk [app name or package name]
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
`
                }, { quoted: m });
            }

            const searchUrl = `https://api.maher-zubair.tech/download/apk?id=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl);
            const appData = response.data.result;

            if (!appData || !appData.dllink) {
                await sendReactionMessage(sock, m, '❌'); // Error reaction
                return await sock.sendMessage(m.key.remoteJid, { text: '✨ Sorry, I couldn\'t find that app. ✨' }, { quoted: m });
            }

            // Send the download prompt with aesthetic styling and emojis
            const downloadPromptText = `
╭• ─────────── ✾ ─────────── •╮
┊       📥 Download APK 📥
╰• ─────────── ✾ ─────────── •╯
           
╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ 🔤 *App:* ${appData.name}
┊ 🔢 *Version:* ${appData.version}
┊ 📏 *Size:* ${appData.size}
┊ 📅 *Last Updated:* ${appData.lastup}
┊ 📦 *Package:* ${appData.package}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
           
*Reply with "1" to download this APK.* 

⚠️ *Disclaimer:* Downloading APKs from unknown sources can be risky. Only download apps from trusted sources.
           `;

            const captionMsg = `
╭• ─────────── ✾ ─────────── •╮
┊     📥 APK Downloaded 📥
╰• ─────────── ✾ ─────────── •╯
           
╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ 🔤 *App:* ${appData.name}
┊ 🔢 *Version:* ${appData.version}
┊ 📏 *Size:* ${appData.size}
┊ 📅 *Last Updated:* ${appData.lastup}
┊ 📦 *Package:* ${appData.package}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;

            // Optional: Send the app icon along with the text
            const promptMessage = await sock.sendMessage(m.key.remoteJid, {
                image: { url: appData.icon },
                caption: downloadPromptText
            }, { quoted: m });

             // Event Listener for Download Confirmation (Using stanzaId)
             let timeoutId; // Declare timeoutId outside the listener to be able to clear it later
            const listener = async (message) => {
                if (
                    message.key.remoteJid === m.key.remoteJid &&
                    message.message?.extendedTextMessage?.contextInfo?.stanzaId === promptMessage.key.id &&
                    message.message?.conversation === '1' || message.message?.extendedTextMessage?.text === '1'
                ) {
                    // Download and send APK with enhanced logic
                    try {
                        HacxK.off('hacxk.messages', listener);
                        clearTimeout(timeoutId); // Clear the timeout if the user responded
                        // Convert size string to bytes (assuming MB format)
                        const appSizeInBytes = parseFloat(appData.size.replace(' MB', '')) * 1024 * 1024;

                        if (appSizeInBytes > settings.maxDownloadSize) {
                            const errorMessage = `
╭• ─────────── ✾ ─────────── •╮
┊ ⚠️  Download Limit Exceeded  ⚠️
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ The app "${appData.name}" exceeds the
┊ maximum allowed download size.
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊ You can still download it directly:
┊ 🔗 ${appData.dllink}
╰───────────────┈ ἤ
`;
                            await sendReactionMessage(sock, m, '⚠️'); // Warning reaction
                            return await sock.sendMessage(m.key.remoteJid, {
                                image: { url: appData.icon },  // Send the app icon with the error
                                caption: errorMessage
                            }, { quoted: m });
                        }

                        const buffer = await download(appData.dllink);
                        await sendReactionMessage(sock, m, '⏳');

                        // Sanitize filename to avoid invalid characters
                        const sanitizedName = sanitize(appData.name);
                        const fileName = `${sanitizedName}.apk`;

                        // Create temp directory if it doesn't exist
                        const tempDirPath = path.join(__dirname, '../temp');
                        if (!fs.existsSync(tempDirPath)) {
                            fs.mkdirSync(tempDirPath);
                        }

                        const filePath = path.join(tempDirPath, fileName);
                        fs.writeFileSync(filePath, buffer);

                        await sock.sendMessage(m.key.remoteJid, {
                            document: fs.readFileSync(filePath),
                            mimetype: 'application/vnd.android.package-archive',
                            caption: captionMsg,
                            fileName: appData.name + ".apk" // Use original name from API
                        }, { quoted: m });

                        fs.unlinkSync(filePath);
                        await sendReactionMessage(sock, m, '✅');
                    } catch (err) {
                        console.error("Error downloading APK:", err);
                        sock.sendMessage(m.key.remoteJid, { text: '✨ Oops! There was an error downloading the APK. ✨' }, { quoted: m });
                    }
                }
            };

            // Set a timeout to remove the listener if no response after 30 seconds
            timeoutId = setTimeout(async () => {
                HacxK.off('hacxk.messages', listener);
                await sock.sendMessage(m.key.remoteJid, {
                    text: '✨ Download request timed out. ✨'
                }, { quoted: m });
            }, 30000); // 30 seconds

            // Attach the listener to the event
            HacxK.on('hacxk.messages', listener);
        } catch (error) {
            console.error('Error downloading APK:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! There was an error finding the APK. Please try again later! ✨'
            }, { quoted: m });
        }
    }
};

// Helper function to send a reaction message
async function sendReactionMessage(sock, message, reaction) {
    const reactionMessage = {
        react: {
            text: reaction,
            key: message.key
        }
    };
    await sock.sendMessage(message.key.remoteJid, reactionMessage);
}
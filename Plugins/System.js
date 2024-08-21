const { fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const axios = require('axios');
const os = require('os');
const path = require('path');

module.exports = {
    usage: ['sys', 'system'],
    description: 'Get the deets on this hot bot.',
    emoji: '💖',
    commandType: 'Utility',
    isWorkAll: true,

    async execute(sock, m) {
        let profilePicPath = null;
        let connection = sock.browserDescription || 'Unknown';
        let platform = os.platform();
        let cpu = os.cpus()[0];
        let version = 'Unknown'; // Default version if fetch fails
        let errorMessage = null;

        try {
            // Fetch latest version of WA Web
            const { version: latestVersion, isLatest } = await fetchLatestBaileysVersion();
            if (latestVersion) {
                version = latestVersion;
            } else {
                errorMessage = 'Failed to fetch the latest version.';
            }
        } catch (error) {
            console.error('Error fetching latest version:', error);
            errorMessage = 'Failed to fetch the latest version.';
        }

        try {
            const picUrl = await sock.profilePictureUrl(m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid, 'image');
            const downloadPath = path.join(__dirname, '..', 'temp');
            fs.mkdirSync(downloadPath, { recursive: true });
            profilePicPath = path.join(downloadPath, `${m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid}.jpg`);
            await downloadImage(picUrl, profilePicPath);
        } catch (error) {
            console.error('Error fetching/saving profile picture:', error);
            errorMessage = 'Error fetching/saving profile picture.';
        }

        const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2); // MB
        const uptime = formatUptime(process.uptime());
        const             // Default system info message
        message = `
╭───────「 *Mirage Bot* 」
│🔥 Hey there, hottie! 🔥
├──────────────────
│💋 Connection: ${connection}
│🧠 RAM: ${ramUsage}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│💻 Platform: ${platform}
│💪 CPU: ${cpu ? cpu.model : 'Top Secret'}
│😎 OS: ${os.release()} (${os.arch()})
│💁‍♀️ WhatsApp: ${version}
│⏰ Uptime: ${uptime}
├──────────────────
│Anything else you wanna know? 😘
╰──────────────────`;
        
        // Send the message with the profile picture, if available
        await sock.sendMessage(m.key.remoteJid, {
            image: profilePicPath ? { url: profilePicPath } : undefined,
            caption: errorMessage || message, // Send error message if there was an error
        }, { quoted: m })
        .then(() => {
            if (profilePicPath) {
                fs.unlinkSync(profilePicPath);
            }
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
    }
};

async function downloadImage(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

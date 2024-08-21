const axios = require('axios');

module.exports = {
    usage: ['ssweb', 'webscreenshot'],
    description: 'Capture a website screenshot (pc, mobile, tablet)',
    emoji: '📸',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const websiteUrl = args[0];
            if (!websiteUrl) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `Usage: /ssweb [website_url] [size (optional: pc, mobile, tablet)]`
                }, { quoted: m });
            }

            const size = args[1]?.toLowerCase() || 'pc';  // Default to PC if size is not specified or invalid
            const validSizes = ['pc', 'mobile', 'tablet'];
            if (!validSizes.includes(size)) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `Invalid size. Please choose from: pc, mobile, tablet`
                }, { quoted: m });
            }

            let apiUrl;
            switch (size) {
                case 'pc':
                    apiUrl = `https://api.maher-zubair.tech/misc/ssweb?url=${encodeURIComponent(websiteUrl)}`;
                    break;
                case 'mobile':
                    apiUrl = `https://api.maher-zubair.tech/misc/ssphone?url=${encodeURIComponent(websiteUrl)}`;
                    break;
                case 'tablet':
                    apiUrl = `https://api.maher-zubair.tech/misc/sstab?url=${encodeURIComponent(websiteUrl)}`;
                    break;
            }

            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' }); // Get response as a buffer
            const imageBuffer = Buffer.from(response.data, 'binary'); // Convert buffer to binary

            const caption = `📸 Screenshot of ${websiteUrl} (${size} view)`;
            await sock.sendMessage(m.key.remoteJid, {
                image: imageBuffer,  // Send the raw image buffer
                caption: caption
            }, { quoted: m });

        } catch (error) {
            console.error('Error fetching screenshot:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t get the screenshot right now. Please try again later! ✨'
            }, { quoted: m });
        }
    }
};

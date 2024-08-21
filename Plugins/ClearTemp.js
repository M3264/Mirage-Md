const fs = require('fs');
const path = require('path');

module.exports = {
    usage: ['cleartemp'],
    description: 'Clear downloaded files from the temp folder',
    emoji: '🧹',  // Broom emoji for cleaning
    commandType: 'Admin',
    isWorkAll: true,
    isAdminUse: true, // Set to false for general use
    async execute(sock, m) {
        try {
            const tempDirPath = path.join(__dirname, '../temp');

            // Check if the directory exists
            if (!fs.existsSync(tempDirPath)) {
                await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } }); // Folder not found reaction
                return await sock.sendMessage(m.key.remoteJid, { text: '✨ The temp folder doesn\'t exist! ✨' }, { quoted: m });
            }

            // Get files in the directory
            const files = fs.readdirSync(tempDirPath);

            // Check if there are any files
            if (files.length === 0) {
                await sock.sendMessage(m.key.remoteJid, { react: { text: '🙂', key: m.key } }); // Already empty reaction
                return await sock.sendMessage(m.key.remoteJid, { text: '✨ The temp folder is already empty! ✨' }, { quoted: m });
            }

            // Delete files
            await sock.sendMessage(m.key.remoteJid, { react: { text: '⏳', key: m.key } }); // Cleaning in progress reaction
            for (const file of files) {
                fs.unlinkSync(path.join(tempDirPath, file));
            }
            await sock.sendMessage(m.key.remoteJid, { react: { text: '✅', key: m.key } }); // Success reaction
            await sock.sendMessage(m.key.remoteJid, { text: '🧹 Temp folder cleaned up! ✨' }, { quoted: m });

        } catch (error) {
            console.error('Error clearing temp folder:', error);
            await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } }); // Error reaction
            await sock.sendMessage(m.key.remoteJid, { text: '✨ Oops! There was an error clearing the temp folder. ✨' }, { quoted: m });
        }
    }
};
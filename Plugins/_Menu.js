const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
    usage: ['menu', 'help'],
    description: 'Display the available commands',
    emoji: '📜',
    commandType: 'Utility',
    isWorkAll: true,

    async execute(sock, m, args, commands) {
        let userProfilePicPath = null; // Store the local file path of the profile picture
        const startTime = Date.now();
        const pingMessage = await sock.sendMessage(m.key.remoteJid, { text: '⚡ Calculating commands...' }, { quoted: m });
        const responseTime = Date.now() - startTime;
        const profilePicUrl = await sock.profilePictureUrl(m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid, 'image');
        const downloadPath = path.join(__dirname, '..', 'temp');
        fs.mkdirSync(downloadPath, { recursive: true }); // Ensure the temp folder exists
        userProfilePicPath = path.join(downloadPath, `${m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid}.jpg`);
        await downloadImage(profilePicUrl, userProfilePicPath);

        const prefix = '/';
        const botUptime = process.uptime();

        // Dynamically build commandTypes
        const commandTypes = {};
        let totalCommands = 0; 
        for (const commandKey of Object.keys(commands)) {
            const command = commands[commandKey];
            if (command.commandType) {
                commandTypes[command.commandType] = commandTypes[command.commandType] || [];
                commandTypes[command.commandType].push(command);
                totalCommands += Array.isArray(command.usage) ? command.usage.length : 1;
            }
        }

        if (Object.keys(commandTypes).length === 0) {
            await sock.sendMessage(m.key.remoteJid, {
                text: "Oops! It seems there are no commands available right now. Please check back later or contact the bot owner."
            }, { quoted: m });
            return;
        }

        const shuffledTypes = shuffleArray(Object.keys(commandTypes));

        // Menu Configuration (Customize this!)
        const menuTitle =   `🌸  ${settings.botMenuTitle}  🌸`; 
        const menuSeparator = "╭• ─────────── ✾ ─────────── •╮"; 
        const infoEmoji = "📜"; 
        const ownerEmoji = "👤"; 

        let menuText = `
${menuSeparator}
┊ 🎀  ${menuTitle}   🎀
${menuSeparator}

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ✧ *ɴᴀᴍᴇ:* ${settings.botName}
┊ ✧ *ᴠᴇʀꜱɪᴏɴ:* 1.1
┊ ✧ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(botUptime)}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ✧ *ᴘʀᴇꜰɪx:* '/ . !'
┊ ✧ *ᴘɪɴɢ:* ${responseTime}ms
┊ ✧ *ᴏᴡɴᴇʀ:* ${settings.ownerNames.join(', ')}
┊ ✧ *ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ:* ${totalCommands}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊ *ɴᴇᴇᴅ ʜᴇʟᴘ?*
┊  ✨ 𝐇𝐄𝐑𝐄'𝐒 𝐖𝐇𝐀𝐓 𝐈 𝐂𝐀𝐍 𝐃𝐎: ✨
╰───────────────┈ ἤ
`;

        // Dynamically Generate Command Sections
        for (const type of shuffledTypes) {
            const commandsOfType = commandTypes[type];
            const emoji = commandTypes[type][0]?.emoji || '✨'; 
            menuText += `
╭─────「 ${emoji}  ${type}  ${emoji} 」─────╮
`;
            shuffleArray(commandsOfType);
            commandsOfType.forEach(command => {
                const cmds = Array.isArray(command.usage) ? command.usage : [command.usage];
                cmds.forEach(cmd => {
                    menuText += `┊ ${emoji} \`${prefix}${cmd}\` - ${command.description || 'No description available'}\n`;
                });
            });
            menuText += `╰──────────────────────╯\n`;
        }

        menuText += `
╭─「 ${infoEmoji} Other ${infoEmoji} 」─╮
┊ 🔍 To get more information about a command, type:
┊   \`/command -h\`
╰─────────────╯
╭─「 ${ownerEmoji} Contact ${ownerEmoji} 」─╮
┊ 👤 For questions or issues, contact the owner:
┊wa.me/2347013159244
╰─────────────╯
${menuSeparator}
`; // Close with menuSeparator

        await sock.sendMessage(m.key.remoteJid, {
            image: userProfilePicPath ? { url: userProfilePicPath } : undefined,
            caption: menuText
        }, { quoted: m })
            .then(() => {
                if (userProfilePicPath) { // Delete the downloaded image after sending
                    fs.unlinkSync(userProfilePicPath);
                }
            });
    }
};

// Function to shuffle an array randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Helper functions
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}

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

const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
    usage: ['rules'],
    description: 'Lay down the law for this elite operation.',
    emoji: '⚔️',
    commandType: 'Safe',
    isWorkAll: true,

    async execute(sock, m) {
        let userProfilePicPath = null; // Store the local file path of the profile picture
        try {
            const profilePicUrl = await sock.profilePictureUrl(m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid, 'image');
            const downloadPath = path.join(__dirname, '..', 'temp');
            fs.mkdirSync(downloadPath, { recursive: true }); // Ensure the temp folder exists
            userProfilePicPath = path.join(downloadPath, `${m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid}.jpg`);
            await downloadImage(profilePicUrl, userProfilePicPath);

            const botRules = `
*🌟 Welcome to the Enchanting World of ! Mirage!✨*

📙 *\`\`\`Name\`\`\`:* ${m.pushName}           
🔢 *\`\`\`Number\`\`\`:* \`@${m.key.remoteJid.endsWith('@g.us') ? m.key.participant.split('@')[0] : m.key.remoteJid.split('@')[0]}\`

1. 💬 *Respect Everyone:* Treat all users with kindness and avoid any form of harassment or discrimination.
2. 🌐 *Keep it Clean:* Refrain from sharing explicit content or engaging in sexually suggestive conversations.
3. 🎯 *Stay on Topic:* Let's keep our chats focused and relevant to the purpose of this group/bot.
4. 📵 *No Spamming:* Avoid flooding the chat with excessive messages or irrelevant content.
5. 🎉 *Have Fun:* Most importantly, let loose and enjoy the captivating experience this bot has to offer!

_✨ Violations of these rules may result in temporary or permanent restrictions. ✨_

*Let's create a mesmerizing and enjoyable experience for everyone!* 😉

*Thank you for being a part of our community! 💖*
        `;

            const groupRules = `
*📜 Group Commandments:*

1. 💬 *Show Up & Show Out:* Don't be a ghost. We want to see your face (and maybe more 😉) in the chat.
2. 🗣️ *Language:* English or any language that gets your point across. Just keep it understandable.
3. 📣 *Announcements:* Only admins get to make the big announcements. Don't try to steal their thunder.
4. 🤐 *Keep Your Secrets:* No personal info, no doxxing, no snitching. We all have our secrets.
5. 🎉 *Embrace the Fun:* Let loose, be yourself, and have a blast. This is your playground.

*Break the rules, and you're out. Simple as that.*
        `;

            const combinedRulesMessage = `${botRules}\n${groupRules}`;

            const rulesMessage = m.key.remoteJid.endsWith('@g.us') ? combinedRulesMessage : botRules;

            await sock.sendMessage(m.key.remoteJid, {
                image: userProfilePicPath ? { url: userProfilePicPath } : undefined,
                caption: rulesMessage
            }, { quoted: m })
                .then(() => {
                    if (userProfilePicPath) { // Delete the downloaded image after sending
                        fs.unlinkSync(userProfilePicPath);
                    }
                });
        } catch (error) {
            console.error('Error fetching/saving profile picture:', error);
        }
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

const axios = require('axios');

module.exports = {
    usage: ['checkmail', 'getmail'],
    description: 'Check inbox of a temporary email address',
    emoji: '💌',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const emailId = args[0];
            if (!emailId) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `Usage: /checkmail [email_id]`
                }, { quoted: m });
            }

            const apiUrl = `https://api.maher-zubair.tech/misc/get_inbox_tempmail?q=${emailId}`;
            const response = await axios.get(apiUrl);

            // Handle empty inbox and potentially nested results
            const inboxData = response.data.result?.[0]?.[0] || [];

                        if (!inboxData || inboxData.length === 0) {
                            const noMailText = `
            ╭• ─────────── ✾ ─────────── •╮
            ┊ 📭  Your inbox is empty!  📭
            ╰• ─────────── ✾ ─────────── •╯
            `;
                            return await sock.sendMessage(m.key.remoteJid, { text: noMailText }, { quoted: m });
                        }

            let inboxText = `
╭• ─────────── ✾ ─────────── •╮
┊ 💌  Inbox for ${inboxData.toAddr}  💌
╰• ─────────── ✾ ─────────── •╯
`;

            // Check if email.text is defined before using substring
            const messagePreview = inboxData.text ? inboxData.text.substring(0, 100) + "..." : "No message preview available";

            inboxText += `
         ╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
         ┊ ✨ *From:* ${inboxData.fromAddr}
         ┊ 💫 *Subject:* ${inboxData.headerSubject}
         ┊ ✉️ *Message Preview:*
         ┊  ${messagePreview} 
         ┊ 🔗 *Download:* ${inboxData.downloadUrl}
         ╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
         `;

            await sock.sendMessage(m.key.remoteJid, { text: inboxText }, { quoted: m });
        } catch (error) {
            console.error('Error checking inbox:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t check your inbox right now. Please try again later! ✨'
            }, { quoted: m });
        }
    }
};

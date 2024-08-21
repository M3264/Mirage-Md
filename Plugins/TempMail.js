const axios = require('axios');

module.exports = {
    usage: ['tempmail'],
    description: 'Generates a temporary email address',
    emoji: '✉️', // Envelope emoji
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.maher-zubair.tech/misc/tempmail');
            const emailData = response.data.result; // Assuming API returns directly the email object

            const tempMailText = `
╭• ─────────── ✾ ─────────── •╮
┊ ✉️ Temporary Email Address ✉️
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *Your Email:* ${emailData[0]}
┊ *Your Email ID:* ${emailData[1]}
┊ *Created On:* ${emailData[2]}
┊
┊ _*Disclaimer:* This email is temporary and will expire._
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: tempMailText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching temporary email:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t create a temporary email right now. Please try again later! ✨'
            }, { quoted: m });
        }
    }
};

const axios = require('axios');

module.exports = {
    usage: ['pickupline', 'flirt'],
    description: 'Get a random romantic pickup line 😉',
    emoji: '💖',
    commandType: 'Fun',
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.maher-zubair.tech/misc/lines');
            const pickupLine = response.data.result;

            const pickupLineText = `
╭• ─────────── ✾ ─────────── •╮
┊ 💖  Flirty Pickup Line  💖
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *${pickupLine}*
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;

            await sock.sendMessage(m.key.remoteJid, { text: pickupLineText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching pickup line:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t find a pickup line right now. Maybe try again later? 😉'
            }, { quoted: m });
        }
    }
};

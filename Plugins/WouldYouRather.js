const axios = require('axios');

module.exports = {
    usage: ['wyr'],
    description: 'Play a round of "Would You Rather?"',
    emoji: '🤔',
    commandType: 'Fun',
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.truthordarebot.xyz/api/wyr');
            const questionData = response.data;

            const wyrText = `
╭• ─────────── ✾ ─────────── •╮
┊  🤔  Would You Rather... ? 🤔 
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ${questionData.question}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

╭──────────────────────╮
┊ 🅰️   ${questionData.option_1}
╰──────────────────────╯
╭──────────────────────╮
┊ 🅱️   ${questionData.option_2}
╰──────────────────────╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊ Choose wisely! ✨
╰───────────────┈ ἤ
`;

            await sock.sendMessage(m.key.remoteJid, { text: wyrText }, { quoted: m, mentions: [m.sender] });

        } catch (error) {
            console.error("Error fetching WYR question:", error);
            await sock.sendMessage(m.key.remoteJid, { 
                text: '✨ Oops! I couldn\'t find a "Would You Rather?" question right now. Try again later! ✨'
            }, { quoted: m });
        }
    }
};

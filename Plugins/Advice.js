const axios = require('axios');

module.exports = {
    usage: ['advice', 'tip'],
    description: 'Get a random piece of advice to ponder',
    emoji: '💡',
    commandType: 'Inspirational',
    isWorkAll: true,

    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.adviceslip.com/advice');
            const adviceData = response.data.slip;

            if (!adviceData || !adviceData.advice) {
                throw new Error('Invalid advice response from API');
            }

            // Enhanced Aesthetic UI
            const adviceText = `
╭• ─────────── ✾ ─────────── •╮
┊ 💭  Word of Wisdom  💭  
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ${adviceData.advice}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: adviceText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching advice:', error.message);
            
            // Fallback Quote in Case of Error
            const fallbackQuotes = [
                "The journey of a thousand miles begins with a single step.",
                "Believe you can and you're halfway there.",
                "Don't watch the clock; do what it does. Keep going.",
            ];
            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

            const errorText = `
╭• ─────────── ✾ ─────────── •╮
┊ ✨  A Little Inspiration  ✨
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ${randomQuote}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;

            await sock.sendMessage(m.key.remoteJid, { text: errorText }, { quoted: m });
        }
    }
};

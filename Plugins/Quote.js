const axios = require('axios');

module.exports = {
    usage: ['quote', 'inspire'], 
    description: 'Get a random inspirational quote with beautiful styling',
    emoji: '✨',
    commandType: 'Motivation', 
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.quotable.io/random');
            const quoteData = response.data;

            // Premium UI with Enhanced Styling
            const quoteText = `
╭────────── *✨ Inspiring Quote ✨* ──────────╮
┊ 
┊  ❝ ${quoteData.content} ❞
┊ 
╰┈─────── ೄྀ࿐ ˊˎ-
┊      *— ${quoteData.author}*
╰─━━━━━━⊱✿⊰━━━━━━─╯
`; 

            await sock.sendMessage(m.key.remoteJid, { text: quoteText }, { quoted: m });
        } catch (error) {
            console.error("Error fetching quote:", error); 
            await sock.sendMessage(m.key.remoteJid, { text: '✨ Sorry, I couldn\'t find an inspiring quote right now. Try again later! ✨' }, { quoted: m });
        }
    }
};

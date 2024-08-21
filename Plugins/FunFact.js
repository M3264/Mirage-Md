const axios = require('axios');

module.exports = {
    usage: ['fact', 'funfact'],
    description: 'Get a random fun fact with a delightful presentation',
    emoji: '🤯',
    commandType: 'Fun',
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const factData = response.data;

            // Premium UI with Enhanced Styling
            const factText = `
╭┈─────── ೄྀ࿐ ˊˎ-
┊      🤯  Fun Fact!  🤯
╰┈─────── ೄྀ࿐ ˊˎ-

╭─━━━━━━⊱✿⊰━━━━━━─╮
┊   💭  ${factData.text} 
╰─━━━━━━⊱✿⊰━━━━━━─╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊   🔗 *Source:* ${factData.source_url}
╰───────────────┈ ἤ
`;

            await sock.sendMessage(m.key.remoteJid, { text: factText }, { quoted: m });
        } catch (error) {
            console.error("Error fetching fun fact:", error);
            await sock.sendMessage(m.key.remoteJid, { text: '✨ Oops! I couldn\'t find a fun fact right now. Try again later! ✨' }, { quoted: m });
        }
    }
};

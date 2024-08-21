const axios = require('axios');

module.exports = {
    usage: ['semoji', 'findemoji'],
    description: 'Search for emojis based on a keyword',
    emoji: '😀', // Generic emoji
    commandType: 'Search',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const query = args.join(' ');
            if (!query) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `Usage: /semoji [keyword]`
                }, { quoted: m });
            }

            const apiUrl = `https://api.maher-zubair.tech/search/semoji?q=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);
            const emojis = response.data.result;

            if (emojis.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: 'No emojis found for that keyword.' }, { quoted: m });
            }

            // Premium UI with Emoji Grid
            let emojiText = '';
            if (emojis.length <= 30) {
                // If 5 or fewer emojis, display all in a line
                emojiText = emojis.join(' ');
            } else {
                // If more than 5, display a random selection of 5
                const shuffledEmojis = shuffleArray(emojis);
                emojiText = shuffledEmojis.slice(0, 30).join(' ');
            }

            const responseText = `
╭• ─────────── ✾ ─────────── •╮
┊   Emoji results for "${query}":
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊       ${emojiText}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: responseText }, { quoted: m });

        } catch (error) {
            console.error('Error fetching emojis:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t find any emojis right now. Please try again later! ✨'
            }, { quoted: m });
        }
    }
};

// Function to shuffle an array (you might already have this in your project)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    usage: ['wiki'],
    description: 'Search and summarize information from Wikipedia',
    emoji: '🌐',
    commandType: 'Info',
    isWorkAll: true,
    async execute(sock, m, args) {
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(m.key.remoteJid, { text: 'Usage: /wiki [search term]' }, { quoted: m });
        }

        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${query}&limit=1&namespace=0&format=json`);
            const searchResults = response.data;

            if (!searchResults[1].length) {
                return await sock.sendMessage(m.key.remoteJid, { text: 'No results found on Wikipedia.' }, { quoted: m });
            }

            const pageTitle = searchResults[1][0];
            const pageUrl = searchResults[3][0];
            const pageResponse = await axios.get(pageUrl);
            const $ = cheerio.load(pageResponse.data);

            // Extract a longer summary (up to 3 sentences)
            let summary = '';
            $('#mw-content-text p').each((i, element) => {
                if (i < 3) {
                    summary += $(element).text().trim() + '\n\n';
                }
            });

            // Enhanced Aesthetic Output
            const wikiText = `
╭• ─────────── ✾ ─────────── •╮
┊  📖   *${pageTitle}*  📖   
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ${summary.trim()} 
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊ 🌐 *Learn More:* ${pageUrl}
╰───────────────┈ ἤ
`;

            await sock.sendMessage(m.key.remoteJid, { text: wikiText }, { quoted: m });
        } catch (error) {
            console.error("Error fetching information from Wikipedia:", error);
            await sock.sendMessage(m.key.remoteJid, { text: '✨ Sorry, I couldn\'t find information on Wikipedia. Please try again later! ✨' }, { quoted: m });
        }
    }
};

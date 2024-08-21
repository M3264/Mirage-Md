// plugins/gif.js

const GiphyFetch = require('@giphy/js-fetch-api').GiphyFetch;

module.exports = {
    usage: ['gif', 'giphy'],
    description: 'Searches for 3 random, beautiful GIFs on GIPHY',
    emoji: '✨',
    commandType: 'Search',
    isWorkAll: true,

    async execute(sock, m, args) {
        if (settings.giphyAPIKey === '') {
            await sock.sendMessage(m.key.remoteJid, { react: { text: '😕', key: m.key } }); // No results reaction
            return sock.sendMessage(m.key.remoteJid, { text: 'Please provide a giphy API Key..' }, { quoted: m });
        }

        const gf = new GiphyFetch(settings.giphyAPIKey); 

        // Determine rating based on settings (and potentially the query itself)
        const rating = settings.isAdultSearchEnable ? 'r' : 'g';

        // Use reactions for visual feedback
        await sock.sendMessage(m.key.remoteJid, { react: { text: '🔎', key: m.key } }); // Searching... reaction

        try {
            const { data: gifs } = args.length === 0
                ? await gf.trending({ limit: 3, rating }) // Get trending if no query
                : await gf.search(args.join(' '), { limit: 3, rating }); // Otherwise, search

            if (gifs.length === 0) {
                await sock.sendMessage(m.key.remoteJid, { react: { text: '😕', key: m.key } }); // No results reaction
                return sock.sendMessage(m.key.remoteJid, { text: 'No GIFs found for that search.' }, { quoted: m });
            }

            // Shuffle the GIFs for randomness
            gifs.sort(() => Math.random() - 0.5);

            // Send each GIF with an "await" to ensure sequential sending
            for (const gif of gifs) {
                const gifUrl = gif.images.original.url;
                await sock.sendMessage(m.key.remoteJid, { 
                    video: { url: gifUrl }, 
                    gifPlayback: true,
                    caption: "✨ Here's a beautiful GIF!" // Add a charming caption
                }, { quoted: m });
            }
        } catch (error) {
            console.error("Error fetching GIF:", error);
            await sock.sendMessage(m.key.remoteJid, { react: { text: '⚠️', key: m.key } }); // Error reaction
            sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while searching for GIFs.' }, { quoted: m });
        }
    }
};

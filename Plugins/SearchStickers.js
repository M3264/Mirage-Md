const axios = require('axios');

module.exports = {
    usage: ['stickersearch', 'searchsticker'],
    description: 'Searches for stickers based on a query',
    emoji: '🔍',
    commandType: 'Search',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            const query = args.join(' ');
            if (!query) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: `
╭• ─────────── ✾ ─────────── •╮
┊ 🔍  Sticker Search  🔍
╰• ─────────── ✾ ─────────── •╯
╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *Usage:* /stickersearch [keyword]
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`
                }, { quoted: m });
            }

            const response = await axios.get(`https://api.maher-zubair.tech/search/sticker?q=${encodeURIComponent(query)}`);
            const result = response.data.result;

            if (!result || !result.sticker_url || result.sticker_url.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: '✨ No stickers found for the given query. ✨'
                }, { quoted: m });
            }

            let stickersToSend = result.sticker_url;
            const totalStickers = stickersToSend.length; // Store the total number of stickers found

            if (stickersToSend.length > 5) {
                stickersToSend = stickersToSend.sort(() => 0.5 - Math.random()).slice(0, 5);
            }

            // Enhanced Output
            let stickerText = `
╭• ─────────── ✾ ─────────── •╮
┊ ✨  Sticker Results for "${query}" ✨ 
┊ (Showing ${stickersToSend.length} of ${totalStickers} stickers)
╰• ─────────── ✾ ─────────── •╯
`;

            for (const stickerUrl of stickersToSend) {
                await sock.sendMessage(m.key.remoteJid, { sticker: { url: stickerUrl } }, { quoted: m }); 
            }

            // Send the text message after the stickers
            await sock.sendMessage(m.key.remoteJid, { text: stickerText }, { quoted: m });


        } catch (error) {
            console.error("Error searching stickers:", error.response?.data || error.message); // Log more detailed error information

            const errorMessage = `
╭• ─────────── ✾ ─────────── •╮
┊ ⚠️  Error ⚠️ 
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ An error occurred while searching for stickers.
┊ Please try again later.
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: errorMessage }, { quoted: m });
        }
    }
};

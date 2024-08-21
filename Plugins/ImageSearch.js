const gis = require('g-i-s');

module.exports = {
    usage: ['img', 'googleimg', 'image', 'pic'],
    description: 'Searches for images on Google and sends the top 4 results in HD 🖼️',
    emoji: '🔍',
    commandType: 'Search',
    isWorkAll: true,
    
    async execute(sock, m, args) {
        const { remoteJid } = m.key;

        if (!args.length) {
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction for missing query
            return sock.sendMessage(remoteJid, { text: '🔍 Please provide a search query. Example: `.img cute puppies`' }, { quoted: m }); 
        }

        const query = args.join(' ');

        try {
            await sock.sendMessage(remoteJid, { react: { text: '🔎', key: m.key } }); // Searching reaction
            await sock.sendMessage(remoteJid, { text: 'Searching for images... ✨' }, { quoted: m }); // Stylish message

            // Perform Google Image Search
            gis({ 
                searchTerm: query.toLowerCase(),
                // Ensure SafeSearch is enabled based on settings
                safe: settings.isAdultSearchEnable === true ? true : false
            }, async (error, results) => {
                if (error) {
                    console.error('GIS Error:', error);
                    await sock.sendMessage(remoteJid, { react: { text: '⚠️', key: m.key } }); // Error reaction
                    return sock.sendMessage(remoteJid, { text: 'An error occurred while searching. Please try again later. 😔' }, { quoted: m });
                }

                if (results.length === 0) {
                    await sock.sendMessage(remoteJid, { react: { text: '😕', key: m.key } }); // No results reaction
                    return sock.sendMessage(remoteJid, { text: 'No images found for your query. Please try a different search term.' }, { quoted: m });
                }

                const imagesToSend = results.slice(0, 4); 

                // Send each image found
                for (const image of imagesToSend) {
                    try {
                        await sock.sendMessage(remoteJid, {
                            image: { url: image.url }, // Pass image URL as an object
                            caption: `📸 Image found for *"${query}"*\n\n🔗 Link: ${image.url}`
                        }, { quoted: m });
                    } catch (sendError) {
                        console.error('Error sending image:', sendError);
                        // Handle specific error in sending if needed
                    }
                }
            });
        } catch (error) {
            console.error('Error in execute:', error);
            await sock.sendMessage(remoteJid, { react: { text: '⚠️', key: m.key } }); // Error reaction
            await sock.sendMessage(remoteJid, { text: 'An error occurred. Please try again later. 😔' }, { quoted: m });
        }
    }
};

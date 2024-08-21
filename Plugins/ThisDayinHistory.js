const axios = require('axios');

module.exports = {
    usage: ['thisday', 'onthisday'],
    description: 'Find out what happened on this day in history',
    emoji: '📜',
    commandType: 'Info',
    isWorkAll: true,
    async execute(sock, m) {
        const today = new Date();
        const month = today.getMonth() + 1; // JavaScript months are 0-indexed
        const day = today.getDate();

        try {
            const response = await axios.get(`https://history.muffinlabs.com/date/${month}/${day}`);
            const historyData = response.data.data.Events;
            
            const numEventsToShow = 3; 
            const randomEvents = [];
            while (randomEvents.length < numEventsToShow && randomEvents.length < historyData.length) {
                const randomIndex = Math.floor(Math.random() * historyData.length);
                const randomEvent = historyData[randomIndex];
                if (!randomEvents.includes(randomEvent)) { // Avoid duplicates
                    randomEvents.push(randomEvent);
                }
            }
            
            for (const event of randomEvents) {
                // Generate a unique aesthetic design for each event
                let thisDayText = `
╭• ─────────── ✾ ─────────── •╮
┊  ✨   On This Day in ${event.year}   ✨
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊  ${event.text} 
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
                await sock.sendMessage(m.key.remoteJid, { text: thisDayText }, { quoted: m });
            }
        } catch (error) {
            console.error("Error fetching historical events:", error);
            await sock.sendMessage(m.key.remoteJid, { text: '✨ Sorry, I couldn\'t find any historical events for today. ✨' }, { quoted: m });
        }
    }
};

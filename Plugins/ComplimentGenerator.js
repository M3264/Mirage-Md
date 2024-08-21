const axios = require('axios');

module.exports = {
    usage: ['compliment', 'praise'], 
    description: 'Get a random compliment to brighten your day',
    emoji: '😊',
    commandType: 'Fun', // Categorize as a 'Fun' command
    isWorkAll: true,

    async execute(sock, m) {
        try {
            const response = await axios.get('https://complimentr.com/api');
            const complimentData = response.data;

            if (!complimentData || !complimentData.compliment) {
                throw new Error('Invalid compliment response');
            }

            const complimentText = `
┏━━😊 *COMPLIMENT* 😊━━┓
 ${complimentData.compliment}
┗━━━━━━━━━━━━━━━━┛
            `;

            await sock.sendMessage(m.key.remoteJid, { text: complimentText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching compliment:', error.message); // Log for debugging
            await sock.sendMessage(m.key.remoteJid, { text: 'Error fetching compliment. Please try again later.' }, { quoted: m });
        }
    }
};

const axios = require('axios');

module.exports = {
    usage: ['animalfact'],
    description: 'Get a random fact about an animal',
    emoji: '🐾',
    commandType: 'Info',  // Categorized as an informative command
    isWorkAll: true,

    async execute(sock, m) {
        try {
            const response = await axios.get('https://axoltlapi.herokuapp.com/');

            if (response.status !== 200 || !response.data || !response.data.fact) {
                throw new Error('Invalid animal fact response from API');
            }
            
            const animalData = response.data;

            const animalFactText = `
┏━━🐾 *ANIMAL FACT* 🐾━━┓
 Animal: ${animalData.name}
 Fact: ${animalData.fact}
┗━━━━━━━━━━━━━━━━┛
            `;

            await sock.sendMessage(m.key.remoteJid, { text: animalFactText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching animal fact:', error.message); // Log for debugging
            await sock.sendMessage(m.key.remoteJid, { text: 'Error fetching animal fact. Please try again later.' }, { quoted: m });
        }
    }
};

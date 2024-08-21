const axios = require('axios');

module.exports = {
    usage: ['dadjoke'],
    description: 'Get a random dad joke',
    emoji: '👴',
    commandType: 'Fun', // Categorize as a 'Fun' command
    isWorkAll: true,

    async execute(sock, m) {
        try {
            const response = await axios.get('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } });

            if (response.status !== 200 || !response.data.joke) { // Check for valid response
                throw new Error('Invalid joke response from API'); 
            }

            const jokeData = response.data;

            const jokeText = `
┏━━👴 *DAD JOKE* 👴━━┓
 ${jokeData.joke}
┗━━━━━━━━━━━━━━┛
            `;

            await sock.sendMessage(m.key.remoteJid, { text: jokeText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching dad joke:', error.message); // Log the error for debugging
            await sock.sendMessage(m.key.remoteJid, { text: 'Error fetching dad joke. Please try again later.' }, { quoted: m });
        }
    }
};

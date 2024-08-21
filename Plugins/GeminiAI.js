const axios = require('axios'); // Make sure you have Axios installed

module.exports = {
  usage: ['gemini', 'googleai'],
  description: 'Chat with the Gemini AI',
  emoji: '🤖',
  isWorkAll: true,
  commandType: 'Artificial Intelligence',
  async execute(sock, m, args) {
    const prompt = args.join(' ');
    if (!prompt) {
      await sock.sendMessage(m.key.remoteJid, { text: '🤔 *Please provide a message for Gemini to respond to.*' }, { quoted: m });
      return;
    }

    try {
      // Construct the API URL with the user's prompt
      const apiUrl = `https://api.vihangayt.com/ai/gemini?q=${encodeURIComponent(prompt)}`;

      // Fetch data from the API using Axios
      const response = await axios.get(apiUrl);
      const aiResponse = response.data.data; // Extract the AI's response

      // Send the AI's response
      await sock.sendMessage(m.key.remoteJid, { text: `🤖 ${aiResponse}` }, { quoted: m });
    } catch (error) {
      console.error("Error in Gemini AI command:", error);
      await sock.sendMessage(m.key.remoteJid, { text: '❌ *Oops! Something went wrong with Gemini.*' }, { quoted: m });
    }
  }
};

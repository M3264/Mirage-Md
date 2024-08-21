const axios = require('axios');

module.exports = {
    usage: ['publicapi'],
    description: 'Fetch data from a public API',
    emoji: '🔗',
    commandType: 'Utility', // Add command type categorization
    isWorkAll: true,
    async execute(sock, m, args) {
        const endpoint = args[0];
        if (!endpoint) {
            const usageText = `
╭───────── 🔗 Public API 🔗 ─────────╮
│                                 │
│  Usage: /publicapi [API endpoint URL] │
│  Example: /publicapi https://api.example.com/data │
│                                 │
╰─────────────────────────╯
            `;
            return await sock.sendMessage(m.key.remoteJid, { text: usageText }, { quoted: m });
        }

        try {
            const response = await axios.get(endpoint);

            // Format the JSON response for better readability
            const formattedData = JSON.stringify(response.data, null, 2) // Pretty-print JSON
                                      .replace(/[\{\}\[\]]/g, (match) => ({ '{': 'curly_bracket_open', '}': 'curly_bracket_close', '[': 'square_bracket_open', ']': 'square_bracket_close' }[match]))
                                      .replace(/"([^"]+)":/g, '*$1*:');  // Convert keys to bold for visual clarity

            // Limit response length to prevent flooding the chat
            const maxChars = 3000;
            const truncatedData = formattedData.length > maxChars ? `${formattedData.substring(0, maxChars)}... (truncated)` : formattedData;

            await sock.sendMessage(m.key.remoteJid, { text: truncatedData }, { quoted: m });
        } catch (error) {
            let errorMessage = 'Error fetching data from API.';
            if (error.response && error.response.status) {
                errorMessage += ` Status code: ${error.response.status}`;
            }

            // Premium UI for error message
            const errorText = `
╭───────── ⚠️ Error ⚠️ ─────────╮
│                                 │
│   ${errorMessage}                │
│                                 │
╰─────────────────────────╯
            `;
            await sock.sendMessage(m.key.remoteJid, { text: errorText }, { quoted: m });
        }
    }
};

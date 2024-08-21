const axios = require('axios');

module.exports = {
    usage: ['define'],
    description: 'Get the definition and details of a word',
    emoji: '📖',
    commandType: 'Info', // Categorize the command
    isWorkAll: true,
    async execute(sock, m, args) {
        const word = args.join(' '); // Combine all arguments into a single word/phrase

        if (!word) {
            const usageText = `
╭───────── 📖 Define 📖 ─────────╮
│                                 │
│  Usage: /define [word]           │
│  Example: /define serendipity   │
│                                 │
╰─────────────────────────╯
            `;

            return await sock.sendMessage(m.key.remoteJid, { text: usageText }, { quoted: m });
        }

        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const entry = response.data[0]; 

            // Extract multiple definitions and examples if available
            const definitions = entry.meanings
                .flatMap(meaning => meaning.definitions)
                .slice(0, 3) // Limit to 3 definitions
                .map((def, index) => `*${index + 1}.* ${def.definition}
  Example: ${def.example || 'N/A'}\n`);

            // Premium UI with Word Details
            const definitionText = `
╭───────── 📖 ${entry.word} 📖 ─────────╮
│                                 │
│   *Part of Speech:* ${entry.meanings[0].partOfSpeech} │
│   *Pronunciation:* /${entry.phonetic}/ │
│                                 │
│   Definitions:                   │
│                                 │
${definitions.join('\n')}
│                                 │
╰─────────────────────────╯
            `;

            await sock.sendMessage(m.key.remoteJid, { text: definitionText }, { quoted: m });
        } catch (error) {
            // Error Handling with Premium UI
            const errorText = `
╭───────── ⚠️ Error ⚠️ ─────────╮
│                                 │
│   Word not found or an error   │
│   occurred. Please try again.  │
│                                 │
╰─────────────────────────╯
            `;

            await sock.sendMessage(m.key.remoteJid, { text: errorText }, { quoted: m });
        }
    }
};

// plugins/tts.js

const gTTS = require('google-tts-api');

module.exports = {
    usage: ['tts', 'speak', 'say'],
    description: 'Converts text to speech',
    emoji: '🗣️',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        if (!settings || !settings.tts) { // Check if settings are loaded
            console.error("Error: TTS settings not found. Please check Settings.js.");
            return sock.sendMessage(m.key.remoteJid, {
                text: '⚠️ TTS service is not configured properly.'
            }, { quoted: m });
        }

        if (!args.length) {
            await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
            return sock.sendMessage(m.key.remoteJid, {
                text: '🗣️ Please provide some text to convert. Example: `.tts [text want to say!] [language]`'
            }, { quoted: m });
        }

        let textToSpeak = args.join(' ').trim();
        let language = settings.tts.defaultLanguage || 'en';

        // Limit text length for 10-second audio
        const maxChars = settings.tts.maxChars || 200; // Roughly estimated
        if (textToSpeak.length > maxChars) {
            await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
            return sock.sendMessage(m.key.remoteJid, {
                text: `🗣️ Text is too long! Please limit to ${maxChars} characters.`
            }, { quoted: m });
        }

        try {
            await sock.sendMessage(m.key.remoteJid, { react: { text: '🔊', key: m.key } });

            const url = gTTS.getAudioUrl(textToSpeak, {
                lang: language,
                slow: settings.tts.defaultSpeed,
                host: 'https://translate.google.com',
            });

            const s = await sock.sendMessage(m.key.remoteJid, { audio: { url }, mimetype: 'audio/mp4' }, { quoted: m });
            sock.sendMessage(m.key.remoteJid, {
                text: `*Speech for:*\`\`\` ${textToSpeak}\`\`\``
            }, { quoted: s });
        } catch (error) {
            console.error("Error converting text to speech:", error);
            await sock.sendMessage(m.key.remoteJid, { react: { text: '⚠️', key: m.key } });
            sock.sendMessage(m.key.remoteJid, {
                text: 'An error occurred: ' + (error.message || 'Unknown error')
            }, { quoted: m });
        }
    }
};
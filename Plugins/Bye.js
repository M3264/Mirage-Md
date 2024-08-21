module.exports = {
    usage: ['bye', 'goodbye'],
    description: 'Say goodbye to the group', 
    emoji: '👋',
    commandType: 'Social',  // Added commandType
    isGroupOnly: true,
    isChannelOnly: false,
    isWorkAll: false,

    async execute(sock, m) {
        const byeMessages = [
            'Bye! 👋',
            'See you later, folks!',
            'Farewell! 👋',
            'Goodbye for now! 👋',
            'It was nice chatting with you all! 👋'
        ];

        const randomIndex = Math.floor(Math.random() * byeMessages.length);
        const randomByeMessage = byeMessages[randomIndex];

        await sock.sendMessage(m.key.remoteJid, { text: randomByeMessage }, { quoted: m });
    }
};

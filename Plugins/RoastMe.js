module.exports = {
    usage: ['roastme'],
    description: 'Get roasted by the bot. 🔥', // Emoji in description
    emoji: '🌶️', // Changed emoji to chili pepper
    commandType: 'Fun', // Changed command type to Fun
    isWorkAll: true,

    async execute(sock, m) {
        const userName = m.pushName || "mystery meat"; // Get the user's name or a default

        const roasts = [
            `*${userName}*, you're so dense, light bends around you. ☀️`,
            `If your IQ was any lower, *${userName}*, we'd have to water you twice a week. 🌱`,
            `Hey *${userName}*, I've seen salads dress better than you. 🥗`,
            `*${userName}*, if you were any more inbred, you'd be a sandwich. 🥪`,
            `I'd agree with you, *${userName}*, but then we'd both be wrong. 🤭`,
            `*${userName}*, you're proof that even God makes mistakes sometimes. 🙏`,
            `If brains were dynamite, *${userName}*, you wouldn't have enough to blow your nose. 🤧`,
            `I've met cheeseburgers with more class than you, *${userName}*. 🍔`,
            `*${userName}*, you're like a cloud: when you disappear, it's a beautiful day. ☁️`,
            `Even in a parallel universe, *${userName}*, you'd still be a disappointment. 🌌`
            // ...add more roasts
        ];

        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        await sock.sendMessage(m.key.remoteJid, {
            text: randomRoast,
        }, { quoted: m });
    }
};

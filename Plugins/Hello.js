const { HacxK } = require('../Lib/EventsHandle/EventsHandle');

module.exports = {
    usage: ['Hi', 'Hello'],
    description: 'Say hello and start a conversation',
    emoji: '👋',
    commandType: 'Fun', // Categorize the command
    isGroupOnly: true,
    isChannelOnly: true,
    isWorkAll: false,
    async execute(sock, m, args) {
        // Premium Hello Message
        const helloText = `
╭───────── 👋 Hi there! 👋 ─────────╮
│                                 │
│   Hello there! It's great to see you. │
│   How can I make your day better? 😁  │
│                                 │
╰─────────────────────────╯
        `;

        await sock.sendMessage(m.key.remoteJid, { text: helloText }, { quoted: m });

        const listener = async (message) => {
            const messageContent = extractMessageContent(message);
            
            // Respond to different greetings
            if (messageContent && messageContent.toLowerCase().includes('hello')) {
                const replyText = `
╭───────── 😊 Hey! 😊 ─────────╮
│                                 │
│ Yo! What's up? Tell me how I can help. │
│                                 │
╰─────────────────────────╯
                `;
                await sock.sendMessage(message.key.remoteJid, { text: replyText }, { quoted: message });
                HacxK.off('hacxk.messages', listener); // Remove listener after response
            } else if (messageContent && messageContent.toLowerCase().includes('how are you')) {
                const replyText = `
╭───────── 😊 I'm good! 😊 ─────────╮
│                                 │
│ I'm an AI, so I don't have feelings, but │
│ I'm here to help you with whatever you need! │
│                                 │
╰─────────────────────────╯
                `;
                await sock.sendMessage(message.key.remoteJid, { text: replyText }, { quoted: message });
                HacxK.off('hacxk.messages', listener); // Remove listener after response
            }
        };
        
        // Set a timeout to remove the listener if no response after 30 seconds
        const timeoutId = setTimeout(() => {
            HacxK.off('hacxk.messages', listener);
        }, 30000);
        
        // Attach the listener to the event
        HacxK.on('hacxk.messages', listener);
    }
};

function extractMessageContent(message) {
    if (message.message) {
        if (message.message.conversation) { // Normal text message
            return message.message.conversation;
        } else if (message.message.extendedTextMessage) { // Extended text message
            return message.message.extendedTextMessage.text;
        } else {
            return null; // Other message types (images, videos, etc.)
        }
    }
    return null;
}

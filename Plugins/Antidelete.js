module.exports = {
    usage: ['antidelete', 'nodelete'],
    description: 'Monitor and log deleted messages',
    emoji: '🚫',
    isGroupOnly: false,
    commandType: 'Utility',
    async execute(sock, m, args) {
        sock.ev.on('messages.update', async (update) => {
            for (const msg of update) {
                if (msg.updateType === 'revoke') {
                    const chat = await sock.fetchMessageFromID(msg.key);
                    await sock.sendMessage(m.key.remoteJid, { text: `Message from ${chat.pushName} was deleted:\n${chat.message}` });
                }
            }
        });
    }
}
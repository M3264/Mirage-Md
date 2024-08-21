module.exports = {
    usage: ['statusread', 'status'],
    description: 'Read WhatsApp statuses',
    emoji: '👀',
    isGroupOnly: false,
    commandType: 'Utility',
    async execute(sock, m, args) {
        try {
            const statusUpdates = await sock.fetchStatusUpdates();
            for (const update of statusUpdates) {
                await sock.readMessages([{ remoteJid: update.id, id: update.lastMessageKey.id }]);
            }
            await sock.sendMessage(m.key.remoteJid, { text: 'All statuses read!' });
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: 'Failed to read statuses.' });
            console.error(err);
        }
    }
}
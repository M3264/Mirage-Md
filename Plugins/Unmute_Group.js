module.exports = {
    usage: ['unmute', 'unsilence'], // You can add more aliases
    description: 'Unmute the group chat.',
    emoji: '🔊',
    isGroupOnly: true,
    commandType: 'Admin',
    async execute(sock, m, args) {
        const { remoteJid, participant } = m.key;

        // Initial checks (same as mute command)
        if (!remoteJid.endsWith('@g.us')) {
            await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
            return;
        }

        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber); 

        if (!allowedNumbers.includes(participant)) {
            await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can unmute group chat.*", m);
            return;
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

        if (!botIsAdmin) {
            await sendWithReaction(sock, remoteJid, "🤖", "*I cannot unmute chat because I am not an admin in this group.*", m);
            return;
        }

        const groupInfo = await sock.groupMetadata(remoteJid);
        if (groupInfo.announce) {
            try {
                await sock.groupSettingUpdate(remoteJid, "not_announcement");
                await sendWithReaction(sock, remoteJid, "🔊", "*Group has been unmuted successfully!*", m);
            } catch (error) {
                console.error("Error in group unmute command:", error);
                await sendWithReaction(sock, remoteJid, "❌", "*Oops! Something went wrong.* Please try again later.", m);
            }
        } else {
            await sendWithReaction(sock, remoteJid, "🔊", "*Group is already unmuted!*", m);
        }
    }
};

  // Helper function to send a message with a reaction and WhatsApp font hacks
  async function sendWithReaction(sock, remoteJid, reaction, text, m) {
    // Apply WhatsApp font hacks (bold, italic, etc.) to the text message
    const formattedText = text
        .replace(/\*(.+?)\*/g, "*$1*")   // Bold
        .replace(/_(.+?)_/g, "_$1_")    // Italics
        .replace(/~(.+?)~/g, "~$1~");   // Strikethrough

        await sock.sendMessage(remoteJid, { react: { text: reaction, key: m.key } })
        await sock.sendMessage(remoteJid, { text: text }, { quoted: m })
}
  
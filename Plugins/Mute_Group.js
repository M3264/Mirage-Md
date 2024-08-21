module.exports = {
    usage: ['mute', 'silence'], // You can add more aliases if you'd like
    description: 'Mute the group for a specified duration or indefinitely.',
    emoji: '🔇',
    isGroupOnly: true,
    commandType: 'Admin', 
    async execute(sock, m, args) {
        const { remoteJid, participant } = m.key;

        // Initial checks
        if (!remoteJid.endsWith('@g.us')) {
            await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
            return;
        }

        // Extract the correct bot ID including the server
        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

        // Check if the command sender is the owner or the bot itself
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber); 
        if (!allowedNumbers.includes(participant)) {
            await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can mute group chat.*", m);
            return;
        }

        // Check if the bot is an admin in the group
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

        if (!botIsAdmin) {
            await sendWithReaction(sock, remoteJid, "🤖", "*I cannot mute chat because I am not an admin in this group.*", m);
            return;
        }

        const groupInfo = await sock.groupMetadata(remoteJid);
        if (!groupInfo.announce) {
            await sock.groupSettingUpdate(remoteJid, "announcement");
            await sendWithReaction(sock, remoteJid, "🔇", "*Group has been muted successfully!*", m);
        } else {
            await sendWithReaction(sock, remoteJid, "🔇", "*Group is already muted!*", m);
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
  
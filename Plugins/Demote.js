module.exports = {
    usage: ['demote', 'pd'],
    description: 'Demote an admin to a regular member in the group',
    emoji: '⏬',
    isGroupOnly: true,
    commandType: 'Admin', 
    async execute(sock, m, args) {
      const { remoteJid, participant, quoted } = m.key;
  
      // Initial checks (same as in promote command)
      if (!remoteJid.endsWith('@g.us')) {
        await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
        return;
      }
  
      const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
      const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
      allowedNumbers.push(botNumber); 
  
      if (!allowedNumbers.includes(participant)) {
        await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can demote members.*", m);
        return;
      }
  
      const groupMetadata = await sock.groupMetadata(remoteJid);
      const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);
  
      if (!botIsAdmin) {
        await sendWithReaction(sock, m.key.remoteJid, "🤖", "*I cannot demote members because I am not an admin in this group.*", m);
        return;
      }
  
      let quotedUser;
      if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        quotedUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        quotedUser = m.message.extendedTextMessage.contextInfo.participant;
      }
  
      // Check if quoted user exists
      if (!quotedUser) {
        await sendWithReaction(sock, remoteJid, "🤔", "*Please quote the message of the user you want to demote or mention the user with @.*", m);
        return;
      }
  
      // Check if the quoted user is an admin
      const quotedParticipant = groupMetadata.participants.find(p => p.id === quotedUser);
      if (!quotedParticipant || quotedParticipant.admin === null) {
        await sendWithReaction(sock, remoteJid, "❌", "*The mentioned user is not an admin.*", m);
        return;
      }
  
      try {
        await sock.groupParticipantsUpdate(remoteJid, [quotedUser], "demote");
        await sendWithReaction(sock, remoteJid, "☑️", `@${quotedUser.split("@")[0]} _has been demoted from admin._`, m);
      } catch (error) {
        console.error("Error in demote command:", error);
        await sendWithReaction(sock, remoteJid, "❌", "*Oops! Something went wrong.* Please try again later.", m);
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
  
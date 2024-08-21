module.exports = {
    usage: ['pu', 'promote'],
    description: 'Promote a user to admin in the group',
    emoji: '⏫', 
    isGroupOnly: true,
    commandType: 'Admin',  // Restrict to admins
    async execute(sock, m, args) {
        const { remoteJid, participant, quoted } = m.key;

        // Initial checks (same as in remove command)
        if (!remoteJid.endsWith('@g.us')) {
            await sendWithReaction(sock, remoteJid, "❌", "*This command can only be used in groups.*", m);
            return;
        }

        // Extract the correct bot ID including the server
        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

        // Check if the command sender is the owner or the bot itself
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber); // Add the bot's number AFTER it's defined

        if (!allowedNumbers.includes(participant)) {
            await sendWithReaction(sock, remoteJid, "🚫", "*Only the owner or bot can promote members.*", m);
            return;
        }

        // Check if the bot is an admin in the group
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

        if (!botIsAdmin) {
            await sendWithReaction(sock, m.key.remoteJid, "🤖", "*I cannot promote members because I am not an admin in this group.*", m);
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
            await sendWithReaction(sock, remoteJid, "🤔", "*Please quote the message of the user you want to promote or mention the user with @.*", m);
            return;
        }
        // Find the quoted user's participant object
        const quotedParticipant = groupMetadata.participants.find(p => p.id === quotedUser);

        // Check if the quoted user is a superadmin
        if (quotedParticipant && quotedParticipant.admin === 'superadmin') {
            // Check if the command sender is a superadmin
            const issuerParticipant = groupMetadata.participants.find(p => p.id === participant);
            if (!issuerParticipant || issuerParticipant.admin !== 'superadmin') {
                await sendWithReaction(sock, remoteJid, "🚫", "*⚠️ Only superadmins can promote other members!*", m);
                return; // Stop the command execution
            }
        }

        try {
            await sock.groupParticipantsUpdate(remoteJid, [quotedUser], "promote");
            await sendWithReaction(sock, remoteJid, "🎉", `*Congratulations!* @${quotedUser.split("@")[0]} _has been promoted to admin._`, m);
        } catch (error) {
            console.error("Error in promote command:", error);
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
  
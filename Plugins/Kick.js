module.exports = {
    usage: ['kick', 'remove'],
    description: 'Kick a user from the group',
    emoji: '🚪', // Door emoji
    isGroupOnly: true,
    commandType: 'Admin',
    async execute(sock, m, args) {
        const { remoteJid, participant } = m.key;
    
        // Initial checks with reactions
        if (!remoteJid.endsWith('@g.us')) {
          await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction
          await sock.sendMessage(remoteJid, { text: 'This command can only be used in groups.' }, { quoted: m });
          return;
        }
    
        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber);
    
        if (!allowedNumbers.includes(participant)) {
          await sock.sendMessage(remoteJid, { react: { text: '🚫', key: m.key } }); // Reaction
          await sock.sendMessage(remoteJid, { text: 'Only admins can use this command.' }, { quoted: m });
          return;
        }
    
        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);
    
        if (!botIsAdmin) {
          await sock.sendMessage(remoteJid, { react: { text: '🤖', key: m.key } }); // Reaction
          await sock.sendMessage(remoteJid, { text: 'I cannot kick members because I am not an admin in this group.' }, { quoted: m });
          return;
        }
    
        // Get the user to kick with reaction
        const mentionedJid = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
          await sock.sendMessage(remoteJid, { react: { text: '🤔', key: m.key } }); // Reaction
          await sock.sendMessage(remoteJid, { text: 'Please mention the user you want to kick.' }, { quoted: m });
          return;
        }
    
        try {
          // Kick the user with reaction
          await sock.sendMessage(remoteJid, { react: { text: '🚪', key: m.key } }); // Reaction (door emoji)
          await sock.groupParticipantsUpdate(remoteJid, [mentionedJid], "remove");
    
          // Send the stylish success message
          const kickedUser = mentionedJid.split('@')[0]; 
          const message = `
╭┈───── ೄྀ࿐ ˊˎ-
┆ ☠☠ Hasta la vista, @${kickedUser}! ☠☠ 
┆ 
┆  You've been kicked out of this joint. 
┆  Don't let the door hit ya where the good Lord split ya! 👋
╰┈───── ೄྀ࿐ ˊˎ-
          `;
          await sock.sendMessage(remoteJid, { text: message }, { quoted: m });
        } catch (error) {
          console.error("Error in kick command:", error);
          await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction
          await sock.sendMessage(remoteJid, { text: 'Oops! Something went wrong while kicking the user.' }, { quoted: m });
        }
      }
    };
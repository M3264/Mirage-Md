module.exports = {
  usage: ['groupinfo'],
  description: 'Displays information about the current group',
  emoji: '👥',
  commandType: 'Admin', // Add command type categorization
  isGroupOnly: true,
  async execute(sock, m) {
      const groupMetadata = await sock.groupMetadata(m.key.remoteJid);

      const groupInfoText = `
╭───────── 👥 Group Info 👥 ─────────╮
│                                 │
│   *Name:* ${groupMetadata.subject}         │
│                                 │
│   *Created:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()} │
│   *Owner:* @${groupMetadata.owner.split('@')[0]}    │
│                                 │
│   *Participants:* ${groupMetadata.participants.length} │
│                                 │
│   *Description:* ${(groupMetadata.desc) ? groupMetadata.desc : 'No description'}│
│                                 │
╰─────────────────────────╯
      `;

      // Optional: Send group icon as a separate message
      if (groupMetadata.hasOwnProperty('pictureId')) {
          const groupIcon = await sock.profilePictureUrl(m.key.remoteJid, 'image');
          await sock.sendMessage(m.key.remoteJid, { image: { url: groupIcon }});
      }

      await sock.sendMessage(m.key.remoteJid, { text: groupInfoText }, { quoted: m });
  }
};

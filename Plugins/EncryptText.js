const crypto = require('crypto');

module.exports = {
  usage: ['encrypt'],
  description: 'Encrypt a message and send the encrypted message along with the decryption key.',
  emoji: '🔐',
  commandType: 'Utility',
  isHackEnable: true,
  isWorkAll: true,
  async execute(sock, m, args) {
    try {

      if (args.length === 0) {
        return await sock.sendMessage(m.key.remoteJid, { text: 'Please provide a message to encrypt.' }, { quoted: m });
      }

      const message = args.join(' ');

      // Generate a random key and IV
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);

      // Encrypt the message
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encryptedMessage = cipher.update(message, 'utf8', 'hex');
      encryptedMessage += cipher.final('hex');

      // Send the encrypted message and key
      const response = `
*🔐 Encrypted Message 🔐*
\`\`\`
${encryptedMessage}
\`\`\`

*🔑 Decryption Key and IV 🔑*
\`\`\`
*Key:* ${key.toString('hex')}\n
*IV:* ${iv.toString('hex')}
\`\`\`
      `;
      await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

    } catch (error) {
      // Error handling logic
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while executing the command. Please try again later.' }, { quoted: m });
    }
  }
};

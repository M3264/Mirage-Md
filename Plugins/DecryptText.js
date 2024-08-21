const crypto = require('crypto');

module.exports = {
  usage: ['decrypt'],
  description: 'Decrypt an encrypted message using a specified key and IV.',
  emoji: '🔓',
  commandType: 'Utility',
  isHackEnable: true,
  isWorkAll: true,
  async execute(sock, m, args) {
    try {

      // Check if all required arguments are provided
      if (args.length < 3) {
        return await sock.sendMessage(m.key.remoteJid, { text: 'Please provide the decryption key, IV, and encrypted message.\nExample: decrypt <key> <iv> <encrypted_message>' }, { quoted: m });
      }

      const key = Buffer.from(args[0], 'hex');
      const iv = Buffer.from(args[1], 'hex');
      const encryptedMessage = args.slice(2).join(' ');

      // Decrypt the message
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf8');
      decryptedMessage += decipher.final('utf8');

      // Send the decrypted message
      const response = `
*🔓 Decrypted Message 🔓*
\`\`\`
${decryptedMessage}
\`\`\`
      `;
      await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });

    } catch (error) {
      // Error handling logic
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while executing the command. Please check your input and try again.' }, { quoted: m });
    }
  }
};

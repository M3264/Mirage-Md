module.exports = {
    usage: ['pwcrack'],
    description: 'Simulate a password cracking attack and explain how it works (for educational purposes only!)',
    emoji: '🔑',
    commandType: 'Hacking',
    isHackEnable: true,
    isWorkAll: true,
    async execute(sock, m, args) {
      try {
        // Check if hacking commands are enabled in settings
        if (!settings.isHackEnable) {
          await sock.sendMessage(m.key.remoteJid, { react: { text: '🚫', key: m.key } });
          return await sock.sendMessage(m.key.remoteJid, { text: '🚨 Hacking commands are currently disabled. 🚨' }, { quoted: m });
        }
  
        // Explanation of how Password Cracking works
        const explanation = `
  *🔑 Password Cracking Explained 🔑*
  
  *🔍 What is Password Cracking?*
  Password cracking involves trying to guess or decrypt passwords stored in a system.
  
  *📚 Methods of Password Cracking:*
  - *Brute Force:* Trying all possible combinations until the correct one is found.
  - *Dictionary Attack:* Using a list of common passwords.
  - *Rainbow Tables:* Using precomputed tables to reverse cryptographic hash functions.
  
  *💬 WhatsApp Simulation:*
  If this platform were vulnerable, an attacker might try to guess passwords by brute force.
  
  To stay safe:
  - 🛡️ Use strong, unique passwords.
  - 🔄 Change passwords regularly.
  - 🔒 Enable multi-factor authentication.
  
  *Stay safe and be aware of security best practices!*
        `;
  
        // Send the explanation message
        await sock.sendMessage(m.key.remoteJid, { text: explanation }, { quoted: m });
  
      } catch (error) {
        // Error handling logic
        console.error(error);
        await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while executing the command. Please try again later.' }, { quoted: m });
      }
    }
  };
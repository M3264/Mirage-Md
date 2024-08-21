module.exports = {
    usage: ['phishing'],
    description: 'Simulate a phishing attack and explain how it works (for educational purposes only!)',
    emoji: '🎣',
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
  
        // Explanation of how Phishing Attack works
        const explanation = `
  *🎣 Phishing Attack Explained 🎣*
  
  *🔍 What is Phishing?*
  Phishing attacks trick users into revealing sensitive information by pretending to be a trustworthy entity in electronic communications.
  
  *📚 Example Phishing Attack:*
  You receive an email that looks like it's from your bank, asking you to click a link and enter your login details. The link leads to a fake website controlled by the attacker.
  
  *💬 WhatsApp Simulation:*
  If this were a vulnerable platform, an attacker might send a message with a malicious link, tricking you into revealing your information.
  
  To stay safe:
  - 📧 Be cautious of unsolicited emails and messages.
  - 🔗 Verify links before clicking.
  - 🔒 Enable two-factor authentication.
  
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
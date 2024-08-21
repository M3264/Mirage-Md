module.exports = {
    usage: ['mitm'],
    description: 'Simulate a Man-in-the-Middle attack and explain how it works (for educational purposes only!)',
    emoji: '🔓',
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
  
        // Explanation of how Man-in-the-Middle Attack works
        const explanation = `
  *🔓 Man-in-the-Middle (MitM) Attack Explained 🔓*
  
  *🔍 What is MitM?*
  A Man-in-the-Middle (MitM) attack occurs when an attacker intercepts and possibly alters the communication between two parties who believe they are directly communicating with each other.
  
  *📚 Example MitM Attack:*
  Imagine you are logging into your bank account over an unsecured Wi-Fi network. An attacker on the same network can intercept the traffic and capture your login credentials.
  
  *💬 WhatsApp Simulation:*
  If this platform were vulnerable, an attacker could intercept messages and manipulate their content.
  
  To stay safe:
  - 🔒 Use secure connections (HTTPS).
  - 📶 Avoid using public Wi-Fi for sensitive transactions.
  - 🔑 Use VPNs for secure communication.
  
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
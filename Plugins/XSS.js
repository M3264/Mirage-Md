module.exports = {
  usage: ['xss'],
  description: 'Simulate a basic XSS (Cross-Site Scripting) attack how it works (for educational purposes only!)',
  emoji: '⚠️',
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

      // Explanation of how XSS works
      const explanation = `
*🚨 Cross-Site Scripting (XSS) Explained 🚨*

*🔍 What is XSS?*
Cross-Site Scripting (XSS) is a type of security vulnerability typically found in web applications. It allows attackers to inject malicious scripts into content from otherwise trusted websites. These scripts can be executed in the context of another user's session, potentially leading to theft of session tokens, user impersonation, and more.

*📚 Example XSS Attack:*
Consider a website that displays user comments without proper validation:

\`<input type="text" name="comment">\`


An attacker could inject a script like:

\`<script>alert('XSS');</script>\`


When other users visit the page, the script executes, showing an alert box with "XSS".

*💬 WhatsApp Simulation:*
Imagine the same concept applied here. If this were a vulnerable platform, an attacker might try to send a message that includes a script.

To stay safe:
- 🔗 Never click on unknown links.
- 🛑 Avoid executing scripts or commands from untrusted sources.
- 🔄 Keep your applications and libraries up-to-date.

*Stay safe and be aware of security best practices!*
      `;

      // Send the explanation message
      await sock.sendMessage(m.key.remoteJid, { text: explanation }, { quoted: m });
      
      // Simulated XSS command logic (if any additional logic is needed, it can be added here)
      // For educational purposes only. In practice, you should never use or execute harmful scripts.

    } catch (error) {
      // Error handling logic
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while executing the command. Please try again later.' }, { quoted: m });
    }
  }
};

module.exports = {
  usage: ['sqlinject'],
  description: 'Simulate a basic SQL Injection attack and explain how it works (for educational purposes only!)',
  emoji: '🛠️',
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

      // Explanation of how SQL Injection works
      const explanation = `
*🛠️ SQL Injection (SQLi) Explained 🛠️*

*🔍 What is SQL Injection?*
SQL Injection (SQLi) is a type of attack that allows attackers to execute arbitrary SQL code on a database. This is usually done by inserting malicious SQL statements into an input field for execution by the database.

*📚 Example SQL Injection Attack:*
Consider a website login form that directly inserts user inputs into an SQL query:

\`SELECT * FROM users WHERE username = 'user' AND password = 'pass';\`

An attacker could enter:
\`' OR '1'='1\`
Resulting in:
\`SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '' OR '1'='1';\`

This query always returns true, potentially granting unauthorized access.

*💬 WhatsApp Simulation:*
Imagine the same concept applied here. If this were a vulnerable platform, an attacker might try to manipulate database queries.

To stay safe:
- 📌 Always use prepared statements or parameterized queries.
- 🔒 Validate and sanitize all user inputs.
- 📊 Implement proper error handling and logging.

*Stay safe and be aware of security best practices!*
      `;

      // Send the explanation message
      await sock.sendMessage(m.key.remoteJid, { text: explanation }, { quoted: m });

      // Simulated SQL Injection command logic (for educational purposes only)
      // In practice, you should never use or execute harmful scripts.

    } catch (error) {
      // Error handling logic
      console.error(error);
      await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while executing the command. Please try again later.' }, { quoted: m });
    }
  }
};
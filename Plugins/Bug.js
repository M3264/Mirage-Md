const { initializeDatabase, getDB, closeDatabase } = require('../Lib/Database/db');

module.exports = {
    usage: ['bug'],
    description: 'Report a bug in the bot to the administrators',
    emoji: '🐛',
    commandType: 'Safe',
    isWorkAll: true,
    async execute(sock, m, args) {
        if (!args.length) {
            await sock.sendMessage(m.key.remoteJid, {
                text: '🐛 Please provide a description of the bug you encountered. *Example:*\`/bug <description of the bug>\`'
            }, { quoted: m });
            return;
        }

        const bugDescription = args.join(' ');
        const reporterJid = m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid;

        try {
            await initializeDatabase();
            const db = getDB();
            await logBug(db, reporterJid, bugDescription, JSON.stringify(m));
            const xp = await incrementXP(db, reporterJid);
            await sock.sendMessage(m.key.remoteJid, {
                text: `🐛 Bug report submitted successfully. Thank you for helping us improve! You've earned 250 XP. Your total XP is now ${xp}.`,
                react: { text: "✅", key: m.key } 
            }, { quoted: m });
        } catch (error) {
            console.error('Error logging bug:', error);
            await sock.sendMessage(m.key.remoteJid, {
                text: '⚠️ An error occurred while processing your bug report.'
            }, { quoted: m });
        } finally {
            closeDatabase(); 
        }
    }
};

const logBug = async (db, reporterJid, bugDescription, message) => {
    const timestamp = new Date().toISOString();
    const query = `
        INSERT INTO bugs (reporter_jid, description, timestamp, full_message)
        VALUES (?, ?, ?, ?)
    `;
    await db.run(query, [reporterJid, bugDescription, timestamp, message]);
};

const incrementXP = async (db, userJid) => {
      // Insert or update the user's XP
      query = `
      INSERT INTO users (jid, xp)
      VALUES (?, 50)
      ON CONFLICT(jid) DO UPDATE SET 
          xp = xp + 250
  `;
  await db.run(query, [userJid]);
}
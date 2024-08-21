const { initializeDatabase, getDB, closeDatabase } = require('../Lib/Database/db');

module.exports = {
    usage: ['report'],
    description: 'Report a user or a message to the bot administrators',
    emoji: '🚨',
    commandType: 'Safe',
    isWorkAll: true,

    async execute(sock, m, args) {
        let userJid, messageId, reason, reportedMessage;

        const messageType = Object.keys(m.message)[0];

        if (messageType === 'extendedTextMessage') {
            const contextInfo = m?.message?.extendedTextMessage?.contextInfo || m?.message?.conversation?.contextInfo;

            if (contextInfo?.quotedMessage) {
                // Reporting a quoted message (reply)
                const quotedMsg = contextInfo.quotedMessage;
                userJid = contextInfo.participant;
                messageId = quotedMsg.stanzaId;
                reason = args.join(' ') || "No reason provided";
                reportedMessage = JSON.stringify(m);
            } else if (contextInfo?.mentionedJid?.length > 0) {
                // Reporting a user directly (mentioned)
                userJid = contextInfo.mentionedJid[0];
                messageId = quotedMsg.stanzaId;
                reason = args.join(' ') || "No reason provided";
                reportedMessage = JSON.stringify(m);
            } else {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '🚨 Please *reply* to a message to report it, or *@mention* a user to report them directly.',
                    react: { text: "❌", key: m.key }
                }, { quoted: m });
                return;
            }
        } else {
            // Handle other message types (image, video, audio, etc.)
            for (const key of Object.keys(m.message)) {
                if (m.message[key]?.contextInfo?.participant) {
                    userJid = m.message[key].contextInfo?.participant;
                    break;
                }
            }
            messageId = m.key.id;
            reason = args.join(' ') || "No reason provided";
            reportedMessage = JSON.stringify(m);

            // Validate the reported user (ensure it's a valid JID)
            if (!userJid || !/@s.whatsapp.net\b/.test(userJid)) {
                await sock.sendMessage(m.key.remoteJid, { text: '⚠️ Invalid user. Please ensure you are mentioning or replying to a valid user.' }, { quoted: m });
                return;
            }
        }

        // Ensure we handle group messages by checking for @g.us
        if (m.key.remoteJid.endsWith('@g.us')) {
            userJid = m.key.participant || userJid;
        }

        try {
            await initializeDatabase();
            const db = getDB();

            // Log the report
            await logReport(db, m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid, userJid, messageId, reason, reportedMessage);

            // Increment warnings for the reported user
            const { warnings, xp } = await incrementWarningsAndXP(db, m.key.remoteJid.endsWith('@g.us') ? m.key.participant : m.key.remoteJid, userJid);

            // Send confirmation message with warnings and XP
            const reportConfirmationText = `🚨 Report submitted successfully. The user has received ${warnings} warning${warnings !== 1 ? 's' : ''}. They have earned ${xp} XP.`;
            await sock.sendMessage(m.key.remoteJid, { text: reportConfirmationText, react: { text: "✅", key: m.key } }, { quoted: m });

        } catch (error) {
            console.error('Error logging report:', error);
            await sock.sendMessage(m.key.remoteJid, { text: '⚠️ An error occurred while processing your report.', react: { text: "❌", key: m.key } }, { quoted: m });

        } finally {
            closeDatabase(); // Ensure the database connection is closed properly
        }
    }
};

const logReport = async (db, reporterJid, reportedJid, messageId, reason, reportedMessage) => {
    const timestamp = new Date().toISOString();
    const query = `
        INSERT INTO reports (reporter_jid, reported_jid, message_id, reason, timestamp, reported_message)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.run(query, [reporterJid, reportedJid, messageId, reason, timestamp, reportedMessage]);
};

const incrementWarningsAndXP = async (db, userJid, reporterJid) => {
    const timestamp = new Date().toISOString();
    const XP_THRESHOLD = 1000;

    try {
        // Insert or update the reporter's XP and warnings
        let query = `
            INSERT INTO users (jid, warnings, last_warned, xp)
            VALUES (?, 1, ?, 50)
            ON CONFLICT(jid) DO UPDATE SET 
                warnings = warnings + 1,
                last_warned = ?,
                xp = xp - 5
        `;
        await db.run(query, [reporterJid, timestamp, timestamp]);

        // Insert or update the user's XP
        query = `
            INSERT INTO users (jid, xp)
            VALUES (?, 50)
            ON CONFLICT(jid) DO UPDATE SET 
                xp = xp + 50
        `;
        await db.run(query, [userJid]);

        // Retrieve the updated warnings count and XP
        query = `SELECT warnings, xp, level FROM users WHERE jid = ?`;
        const result = await db.get(query, [userJid]);

        // Check if result is undefined (user not found), handle gracefully
        if (!result) {
            console.error(`User with jid ${userJid} not found in the database.`);
            return { warnings: 0, xp: 0 }; // Return 0 warnings and XP if user not found
        }

        // Check if the user has enough XP to level up
        let { xp, level } = result;
        if (xp >= XP_THRESHOLD) {
            // Retrieve the updated XP and level
            query = `SELECT warnings, xp, level FROM users WHERE jid = ?`;
            const updatedResult = await db.get(query, [userJid]);

            return { warnings: updatedResult.warnings, xp: updatedResult.xp, level: updatedResult.level };
        }

        return { warnings: result.warnings, xp: result.xp, level: result.level };

    } catch (error) {
        console.error('Error incrementing warnings and XP:', error);
        return { warnings: 0, xp: 0, level: 0 };
    }
};

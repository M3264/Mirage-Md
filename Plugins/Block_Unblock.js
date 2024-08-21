const { initializeDatabase, getDB, closeDatabase } = require('../Lib/Database/db');
const { unblockUsers } = require('../Lib/CommandHandle/CommandHandle')



module.exports = {
    usage: ['block', 'unblock'],
    description: 'Block or unblock a user from interacting with the bot',
    emoji: '🚫',
    commandType: 'Admin',
    isWorkAll: true,
    isAdminUse: true,
    async execute(sock, m, args) {
        if ((!m.message?.extendedTextMessage?.contextInfo?.participant && 
            !m.message?.conversation?.contextInfo?.participant &&
            args.length < 1)) {
           
           await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
           
           await sock.sendMessage(m.key.remoteJid, {
               text: `
               ╭───────────────────────✧
               │ 🚫 INVALID COMMAND 🚫
               ╰───────────────────────✧
               
               Please provide a valid command and user.
               To block or unblock a user, reply to their message with the command.
               Example: \`.block\` or \`.unblock\`,
               `,
           }, { quoted: m });
           
           return;
       }
       
        let userJid = null;
        let text = '';
        if (m.message && m.message.conversation) {
            text = m.message.conversation.toLowerCase();
        } else if (m.message && m.message.extendedTextMessage && m.message.extendedTextMessage.text) {
            text = m.message.extendedTextMessage.text.toLowerCase();
        } else if (m.message) {
            for (const key of Object.keys(m.message)) {
                if (m.message[key]?.caption) {
                    text = m.message[key].caption.toLowerCase();
                    break;
                }
            }
        } else {
            return;
        }

        let fsa = text.split(/\s+/).map(str => str.split(/[.!\/]/));
        console.log(fsa)

        // Check for mentionedJid in message context
        for (const key of Object.keys(m.message)) {
            if (m.message[key]?.contextInfo) {
                userJid = m.message[key].contextInfo.mentionedJid[0] || m.message[key].contextInfo.participant;
                break;
            }
        }

        // If no userJid found in mentionedJid, use direct input as user identifier
        if (!userJid) {
            const userIdentifier = args[1];
            if (!userIdentifier) {
                await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
                return await sock.sendMessage(m.key.remoteJid, { text: '🚫 Please mention a user or provide a phone number.' }, { quoted: m });
            }
            userJid = userIdentifier;
        }

        await initializeDatabase();
        const db = getDB();

        try {
            if (fsa[0][1] === 'block') {
                const isBlocked = await isUserBlocked(db, userJid);
                if (isBlocked) {
                    return sock.sendMessage(m.key.remoteJid, { text: `⚠️ User ${userJid} is already blocked.` }, { quoted: m });
                }
                await blockUser(db, userJid);
                sock.sendMessage(m.key.remoteJid, { text: `🚫 User ${userJid} has been blocked.` }, { quoted: m });
                await closeDatabase(); // Close database connection before exiting
            } else if (fsa[0][1] === 'unblock') {
                const isBlocked = await isUserBlocked(db, userJid);
                if (!isBlocked) {
                    return sock.sendMessage(m.key.remoteJid, { text: `⚠️ User ${userJid} is not currently blocked.` }, { quoted: m });
                }
                await unblockUser(db, userJid);
                sock.sendMessage(m.key.remoteJid, { text: `✅ User ${userJid} has been unblocked.` }, { quoted: m });
                await closeDatabase(); // Close database connection before exiting
            } else {
                return sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
                await closeDatabase(); // Close database connection before exiting
            }
        } catch (error) {
            await closeDatabase(); // Close database connection before exiting
            console.error('Error blocking/unblocking user:', error);
            await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
            return sock.sendMessage(m.key.remoteJid, { text: 'An error occurred while processing the request.' }, { quoted: m });
        }
    }
};



async function isUserBlocked(db, jid) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM blocked_users WHERE jid = ?', [jid], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row); // Convert row existence to boolean
            }
        });
    });
}


async function blockUser(db, jid) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO blocked_users (jid) VALUES (?)', [jid], async (err) => {
            if (err) {
                reject(err);
            } else {
                // Call unblockUsers only if the deletion is successful
                await unblockUsers();
                resolve();
            }
        });
    });
}

async function unblockUser(db, jid) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM blocked_users WHERE jid = ?', [jid], async (err) => {
            if (err) {
                reject(err);
            } else {
                // Call unblockUsers only if the deletion is successful
                await unblockUsers();
                resolve();
            }
        });
    });
}

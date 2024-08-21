const fs = require('fs');
const path = require('path');

module.exports = {
    event: ['group-participants.update'], // The Event when this function works
    desc: 'Send Welcome/Promote Messages!', // Description small description what do this
    isEnabled: settings.antiCheckers.sendWelcome,
    async execute(sock, anu) {
        const { id, participants, action } = anu;
        console.log(id)

        // Ensure participants array is not empty
        if (!participants || participants.length === 0) {
            console.error(`[Group Update Error]: No participants found in event data`);
            return;
        }

        const user = participants[0];

        const messageTemplates = {
            add: `
╭━─━─━─≪✠≫─━─━─━╮
✨ Welcome, @${user.split('@')[0]}! ✨
╰━─━─━─≪✠≫─━─━─━╯
🎉 We're thrilled to have you join our awesome community! Feel free to introduce yourself and get to know everyone. 😄
            `,
            remove: `
╭━─━─━─≪✠≫─━─━─━╮
👋 Goodbye, @${user.split('@')[0]}! 👋
╰━─━─━─≪✠≫─━─━─━╯
😔 We'll miss you! Take care and best of luck on your adventures! 
            `,
            promote: `
╭━─━─━─≪✠≫─━─━─━╮
👑 Congratulations, @${user.split('@')[0]}! 👑
╰━─━─━─≪✠≫─━─━─━╯
🎉 You've been promoted to admin! We trust you'll help keep this group amazing! 🙌
            `,
            demote: `
╭━─━─━─≪✠≫─━─━─━╮
🎩 @${user.split('@')[0]} has been demoted. 🎩
╰━─━─━─≪✠≫─━─━─━╯
😎 Enjoy the view from the member side! 
            `
        };

        const reactionEmojis = {
            add: '👋',
            remove: '👋',
            promote: '🎉',
            demote: '😔'
        };

        if (messageTemplates.hasOwnProperty(action)) {
            try {

                // Then send the message first
                const wel = await sock.sendMessage(id, { text: messageTemplates[action] });
                // Send the reaction 
                await sock.sendMessage(id, { react: { text: reactionEmojis[action], key: wel.key } });
            } catch (err) {
                console.error(`[Group Update Error]:`, err); // Log errors
            }
        }
    }
};

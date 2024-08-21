module.exports = {
    // Revoke Group Invite Link
    usage: ['revoke'],
    description: "Revoke the group's current invite link and generate a new one",
    emoji: '🔄',
    isGroupOnly: true,
    commandType: 'Admin',
    async execute(sock, m, args) {
        const { remoteJid, participant } = m.key;
        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";

        // Initial checks
        if (!remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(remoteJid, { text: '❌ This command can only be used in groups.', quoted: m });
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } });
            return;
        }

        //Check if the bot or the owner of the bot triggered the command.
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber);
        if (!allowedNumbers.includes(participant)) {
            await sock.sendMessage(remoteJid, { text: '🚫 Only admins can use this command.', quoted: m });
            await sock.sendMessage(remoteJid, { react: { text: '🚫', key: m.key } });
            return;
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

        if (!botIsAdmin) {
            await sock.sendMessage(remoteJid, { text: '🤖 I cannot revoke the invite link because I am not an admin in this group.', quoted: m });
            await sock.sendMessage(remoteJid, { react: { text: '🤖', key: m.key } });
            return;
        }

        try {
            await sock.groupRevokeInvite(remoteJid);
            const newCode = await sock.groupInviteCode(remoteJid);
            const newInviteLink = `https://chat.whatsapp.com/${newCode}`;
            await sock.sendMessage(remoteJid, { text: `🔄 Invite link revoked. New Invite Link:\n${newInviteLink}` }, { quoted: m });
        } catch (error) {
            console.error('Error revoking invite link:', error);
            await sock.sendMessage(remoteJid, { text: '❌ Failed to revoke the invite link. Please try again later.', quoted: m });
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } });
        }
    }
}
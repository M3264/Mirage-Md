module.exports = {
    usage: ['add', 'join'],
    description: 'Add a user to the group',
    emoji: '➕',
    isGroupOnly: true,
    commandType: 'Admin',
    async execute(sock, m, args) {
        const { remoteJid, participant } = m.key;

        // Initial checks with reactions
        if (!remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction
            await sock.sendMessage(remoteJid, { text: 'This command can only be used in groups.' }, { quoted: m });
            return;
        }

        const botNumber = sock.user.id.replace(/:.*$/, "") + "@s.whatsapp.net";
        const allowedNumbers = settings.ownerNumbers.map(num => num + '@s.whatsapp.net');
        allowedNumbers.push(botNumber);

        if (!allowedNumbers.includes(participant)) {
            await sock.sendMessage(remoteJid, { react: { text: '🚫', key: m.key } }); // Reaction
            await sock.sendMessage(remoteJid, { text: 'Only admins can use this command.' }, { quoted: m });
            return;
        }

        const groupMetadata = await sock.groupMetadata(remoteJid);
        const botIsAdmin = groupMetadata.participants.some(p => p.id.includes(botNumber) && p.admin);

        if (!botIsAdmin) {
            await sock.sendMessage(remoteJid, { react: { text: '🤖', key: m.key } }); // Reaction
            await sock.sendMessage(remoteJid, { text: 'I cannot add members because I am not an admin in this group.' }, { quoted: m });
            return;
        }

        // Get the phone number to add
        const phoneNumber = args[0];
        if (!phoneNumber || !phoneNumber.match(/^\d+$/)) {
            await sock.sendMessage(remoteJid, { react: { text: '🤔', key: m.key } }); // Reaction
            await sock.sendMessage(remoteJid, { text: 'Please provide a valid phone number (e.g., !add 919876543210).', quoted: m });
            return;
        }

        // Add the country code if it's missing
        const fullPhoneNumber = phoneNumber.startsWith(settings.countryCode) ? phoneNumber : `${settings.countryCode}${phoneNumber}`;

        try {
            // Add the user with reaction
            await sock.sendMessage(remoteJid, { react: { text: '⏳', key: m.key } }); // Hourglass reaction for "adding..."
            await sock.groupParticipantsUpdate(remoteJid, [`${fullPhoneNumber}@s.whatsapp.net`], "add");

            // Send the stylish success message with reaction
            const message = `
      ╭┈───── ೄྀ࿐ ˊˎ-
      ┆ ✨ Welcome to the group, ${fullPhoneNumber}! 🎉
      ╰┈───── ೄྀ࿐ ˊˎ-
            `;
            await sock.sendMessage(remoteJid, { react: { text: '✅', key: m.key } }); // Checkmark reaction for success
            await sock.sendMessage(remoteJid, { text: message }, { quoted: m });
            await sock.sendMessage(remoteJid, { text: '.rules', quoted: m });
        } catch (error) {
            console.error("Error in add command:", error);
            if (error.output?.statusCode === 403) {
                await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction
                await sock.sendMessage(remoteJid, { text: 'User has privacy settings that prevent being added without an invite link.', quoted: m });
            } else {
                await sock.sendMessage(remoteJid, { react: { text: '❌', key: m.key } }); // Reaction
                await sock.sendMessage(remoteJid, { text: 'Oops! Something went wrong while adding the user.', quoted: m });
            }
        }
    }
}
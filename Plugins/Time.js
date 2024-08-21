const moment = require('moment-timezone');

module.exports = {
    usage: ['time', 'waktu'], // Added 'waktu' as an alias
    description: 'Tells the current time in your location or a specified timezone',
    emoji: '⏰',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        let timezone = args[0] || moment.tz.guess();
        timezone = timezone.replace(/ /g, "_"); // Replace spaces with underscores for URL formatting

        try {
            const timeString = moment().tz(timezone).format('hh:mm:ss A z');
            const locationName = moment.tz(timezone).zoneName().replace(/_/g, " "); // Convert timezone name to readable format

            // Premium UI with Clock Emoji and Location
            const timeText = `
╭• ─────────── ✾ ─────────── •╮
┊ ⏰  ${locationName} Time  ⏰ 
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ${timeString}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: timeText }, { quoted: m });

        } catch (error) {
            const errorMessage = `
╭───── ⚠️ Error ⚠️ ──────╮
│                          │
│ Invalid timezone. Please │
│ use a valid timezone name  │
│ (e.g., America/New_York).│
│                           │
╰────────────────╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: errorMessage }, { quoted: m });
        }
    }
};

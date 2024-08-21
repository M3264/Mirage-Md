module.exports = {
    usage: ['ping'],
    description: 'Checks the bot\'s response time and network latency',
    emoji: '⚡',
    commandType: 'Utility', 
    isWorkAll: true,
    async execute(sock, m) {
        const startTime = Date.now();
        const pingMessage = await sock.sendMessage(m.key.remoteJid, { text: '⚡ Pinging...' }, { quoted: m });
        const endTime = Date.now();

        const latency = endTime - startTime;
        const responseTime = pingMessage.messageTimestamp - m.messageTimestamp;

        // Enhanced Premium Styling
        const pingText = `
╭─────── ೄྀ࿐ ˊˎ-
┊      ⚡ 𝙋𝙄𝙉𝙂 ⚡ 
╰┈─────── ೄྀ࿐ ˊˎ-

╭─━━━━━━⊱✿⊰━━━━━━─╮
┊   *Latency:*    ${latency}ms 
┊   *Response:*  ${responseTime}ms
╰─━━━━━━⊱✿⊰━━━━━━─╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊  *Bot Speed:*  ${latency < 500 ? '🚀 Fast' : latency < 1000 ? '🚅 Very Fast' : '🐌 Slow'}
╰───────────────┈ ἤ
`;

        await sock.sendMessage(m.key.remoteJid, {
            edit: pingMessage.key,
            text: pingText,
            type: "MESSAGE_EDIT"
        });
    }
};

const os = require('os');

module.exports = {
    usage: ['alive', 'uptime'],
    description: 'Checks if the bot is running and displays system stats',
    emoji: '💚',
    commandType: 'Utility',
    isWorkAll: true,

    async execute(sock, m) {
        const botUptime = process.uptime();
        const systemUptime = os.uptime();

        const aliveText = `
💚 *I'm alive and kicking!* 💚

┏━━━━━━━━━━━━━┓
  ⏳ *Bot Uptime:*   ${formatUptime(botUptime)}
  ⌛ *System Uptime:* ${formatUptime(systemUptime)}
  🖥️ *Platform:*     ${os.platform()}
  🧠 *CPU:*          ${os.cpus()[0].model}
  💾 *Memory Usage:* ${formatBytes(process.memoryUsage().heapUsed)} 
┗━━━━━━━━━━━━━┛
        `;

        await sock.sendMessage(m.key.remoteJid, { text: aliveText }, { quoted: m });
    }
};

// Helper functions
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

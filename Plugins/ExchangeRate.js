const axios = require('axios');
const moment = require('moment-timezone'); // For timezone-aware date/time formatting

module.exports = {
    usage: ['exchange'],
    description: 'Converts currency amounts',
    emoji: '💱',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        const amount = parseFloat(args[0]);
        const fromCurrency = args[1]?.toUpperCase();
        const toCurrency = args[2]?.toUpperCase();

        if (isNaN(amount) || !fromCurrency || !toCurrency) {
            const usageText = `
╭• ─────────── ✾ ─────────── •╮
┊ 💱  Exchange Rates 💱 
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *Usage:* /exchange [amount] [from] [to]
┊ *Example:* /exchange 100 USD EUR
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;
            return await sock.sendMessage(m.key.remoteJid, { text: usageText }, { quoted: m });
        }

        try {
            const response = await axios.get(`https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`);
            const rates = response.data.rates;

            if (!rates[toCurrency]) {
                return await sock.sendMessage(m.key.remoteJid, { text: 'Invalid currency code.' }, { quoted: m });
            }

            const convertedAmount = (amount * rates[toCurrency]).toFixed(2);

            // Premium UI with Enhanced Styling & User Timezone
            const userTimezone = moment.tz.guess(); 
            const dateTime = moment().tz(userTimezone).format('YYYY-MM-DD hh:mm A z'); 

            const resultText = `
╭• ─────────── ✾ ─────────── •╮
┊  💱 Exchange Result 💱
╰• ─────────── ✾ ─────────── •╯

╭─━━━━━━⊱✿⊰━━━━━━─╮
┊ ${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}
┊ *As of:* ${dateTime} (Your Time)
╰─━━━━━━⊱✿⊰━━━━━━─╯
`;

            await sock.sendMessage(m.key.remoteJid, { text: resultText }, { quoted: m });
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
            const errorMessage = `
╭• ─────────── ✾ ─────────── •╮
┊ ⚠️  Error  ⚠️ 
╰• ─────────── ✾ ─────────── •╯

╭─━━━━━━⊱✿⊰━━━━━━─╮
┊ Error fetching exchange rates.
┊ Please try again later.
╰─━━━━━━⊱✿⊰━━━━━━─╯
`;
            await sock.sendMessage(m.key.remoteJid, { text: errorMessage }, { quoted: m });
        }
    }
};

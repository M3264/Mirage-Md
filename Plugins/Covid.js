const axios = require('axios');

module.exports = {
    usage: ['covid'], // Include the optional country parameter
    description: 'Get COVID-19 statistics for a specific country or global data',
    emoji: '🦠',
    commandType: 'Info',
    isWorkAll: true,

    async execute(sock, m, args) {
        const country = args[0] ? args[0].toLowerCase() : 'all'; // Allow for 'all' to get global stats

        try {
            const response = await axios.get(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' : `countries/${country}`}`);

            if (response.status !== 200) {
                throw new Error('Invalid response from COVID-19 API');
            }

            const covidData = response.data;

            const covidText = country === 'all' ? `
╭────── 🦠 GLOBAL COVID-19 Stats 🦠 ───────╮
│ Total Cases: ${covidData.cases}                │
│ Active:      ${covidData.active}               │
│ Recovered:   ${covidData.recovered}            │
│ Deaths:      ${covidData.deaths}               │
╰─────────────────────────╯
            ` : `
╭────── 🦠 COVID-19 Stats for ${covidData.country} 🦠 ───────╮
│ Total Cases: ${covidData.cases}                │
│ Active:      ${covidData.active}               │
│ Recovered:   ${covidData.recovered}            │
│ Deaths:      ${covidData.deaths}               │
│ Today Cases: ${covidData.todayCases}           │
│ Today Deaths: ${covidData.todayDeaths}           │
│ Critical:     ${covidData.critical}             │
╰─────────────────────────╯
            `;

            await sock.sendMessage(m.key.remoteJid, { text: covidText }, { quoted: m });
        } catch (error) {
            console.error('Error fetching COVID-19 data:', error.message);
            await sock.sendMessage(m.key.remoteJid, { 
                text: 'Error fetching COVID-19 data. Please check the country name or try again later.' 
            }, { quoted: m });
        }
    }
};

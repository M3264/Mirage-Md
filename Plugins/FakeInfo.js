const axios = require('axios');

module.exports = {
    usage: ['fakeinfo'],
    description: 'Generates random fake personal information with a touch of flair ✨',
    emoji: '👤',
    commandType: 'Fun',
    isWorkAll: true,
    async execute(sock, m) {
        try {
            const response = await axios.get('https://api.maher-zubair.tech/misc/fakeinfo');

            const fakeInfo = response.data.result.result;

            // Handle missing 'title' property gracefully
            const title = fakeInfo.name.title || ''; // Default to empty string if title is undefined

            const fakeInfoText = `
╭• ─────────── ✾ ─────────── •╮
┊  ✨ 𝐹𝒶𝓀𝑒 𝒫𝑒𝓇𝓈𝑜𝓃𝒶 ✨
╰• ─────────── ✾ ─────────── •╯

╭─── 🌷 𝐼𝒹𝑒𝓃𝓉𝒾𝓉𝓎 🌷 ───╮
┊ *Name:*  ${title} ${fakeInfo.name.first} ${fakeInfo.name.last}
┊ *Email:*  ${fakeInfo.email}
┊ *Phone:*  ${fakeInfo.phone}
┊ *Gender:*  ${fakeInfo.gender}
┊ *Age:*  ${fakeInfo.dob.age}
╰───────────────────╯

╭─── 🌍 𝐿𝑜𝒸𝒶𝓉𝒾𝑜𝓃 🌍 ───╮
┊ *Street:*  ${fakeInfo.location.street}
┊ *City:*  ${fakeInfo.location.city}, ${fakeInfo.location.state}
┊ *Postcode:*  ${fakeInfo.location.postcode}
┊ *Timezone:*  ${fakeInfo.location.timezone.description}
╰───────────────────╯

╭─── 🔐 𝐿𝑜𝑔𝒾𝓃 🔐 ───╮
┊ *Username:*  ${fakeInfo.login.username}
┊ *Password:*  ${fakeInfo.login.password}
╰───────────────────╯

╭┈─────── ೄྀ࿐ ˊˎ-
┊ ⚠️ _*Disclaimer:*_ This is completely fake data!
╰───────────────────┈ ἤ
`;

            // Send profile picture along with the text
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: fakeInfo.picture.large }, 
                caption: fakeInfoText
            }, { quoted: m });

        } catch (error) {
            console.error('Error fetching fake info:', error); // Log the full error object
            await sock.sendMessage(m.key.remoteJid, {
                text: '✨ Oops! I couldn\'t generate fake info right now. Try again later! ✨'
            }, { quoted: m });
        }
    }
};

const axios = require('axios');

// Luhn algorithm to validate the generated BIN
const luhnCheck = (num) => {
    let arr = (num + '')
        .split('')
        .reverse()
        .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce(
        (acc, val, i) =>
            i % 2 !== 0
                ? acc + val
                : acc + ((val *= 2) > 9 ? val - 9 : val),
        0
    );
    sum += lastDigit;
    return sum % 10 === 0;
};

// Generate a random CVV number
const generateCvv = (cardType) => {
    let cvv;
    if (cardType === 'AMEX') {
        cvv = Math.floor(Math.random() * 9000 + 1000).toString();
    } else {
        cvv = Math.floor(Math.random() * 900 + 100).toString();
    }
    return cvv;
};

// Generate a random expiry date
const generateExpiryDate = () => {
    const currentYear = new Date().getFullYear();
    const expiryYear = Math.floor(Math.random() * 5) + currentYear;
    const expiryMonth = Math.floor(Math.random() * 12) + 1;
    return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear.toString().slice(-2)}`;
};

// Generate the next valid BIN based on a given BIN
const generateNextValidBin = (currentBin) => {
    let nextBin;
    let num = parseInt(currentBin, 10);
    do {
        num++;
        nextBin = num.toString().padStart(currentBin.length, '0');
    } while (!luhnCheck(nextBin));
    return nextBin;
};

// Validate BIN and get card type
const validateBinAndGetType = async (bin) => {
    try {
        const response = await axios.get(`https://lookup.binlist.net/${bin}`);
        if (response.status === 200) {
            return {
                valid: true,
                type: response.data.scheme ? response.data.scheme.toUpperCase() : 'UNKNOWN'
            };
        } else {
            return { valid: false };
        }
    } catch (error) {
        console.error('Error validating BIN:', error);
        return { valid: false };
    }
};

module.exports = {
    usage: ['bingen', 'bingenerator'],
    description: 'Generates a random BIN (Bank Identification Number) with accurate details',
    emoji: '💳',
    commandType: 'Utility',
    isWorkAll: true,
    async execute(sock, m, args) {
        try {
            let startBin = args[0];
            if (!startBin || isNaN(startBin) || startBin.length < 6 || startBin.length > 8) {
                startBin = '400000'; // Default BIN if none is provided or invalid input
            }

            const { valid, type } = await validateBinAndGetType(startBin);
            if (!valid) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: '✨ The provided BIN is invalid. Please provide a valid BIN. ✨'
                }, { quoted: m });
            }

            const binData = {
                bin: generateNextValidBin(startBin),
                cvv: generateCvv(type),
                expiry: generateExpiryDate()
            };

            // Format the output
            const binText = `
╭• ─────────── ✾ ─────────── •╮
┊ 💳  BIN Generator  💳
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *BIN:* ${binData.bin}
┊ *CVV:* ${binData.cvv}
┊ *Expiry Date:* ${binData.expiry}
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;

            await sock.sendMessage(m.key.remoteJid, { text: binText }, { quoted: m });

        } catch (error) {
            console.error("Error generating BIN:", error);
            let errorMessage = '✨ Oops! I couldn\'t generate a BIN right now. Please try again later! ✨';
            if (error.response) {
                errorMessage += `\n\nError details: ${error.response.status} - ${error.response.statusText}`;
            }
            await sock.sendMessage(m.key.remoteJid, { text: errorMessage }, { quoted: m });
        }
    }
};

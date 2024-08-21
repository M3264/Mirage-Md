module.exports = {
    usage: 'decide',
    description: 'Helps you make a yes-or-no decision',
    emoji: '🤔',
    commandType: 'Fun',
    isWorkAll: true,

    async execute(sock, m, args) {
        const question = args.join(' ');
        if (!question) {
            return await sock.sendMessage(m.key.remoteJid, {
                text: `
╭• ─────────── ✾ ─────────── •╮
┊ 🤔 Ask me anything... 🤔
╰• ─────────── ✾ ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ *Usage:* /decide [your question]
┊ *Example:* /decide Should I eat pizza? 🍕
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`
            }, { quoted: m });
        }

        const answers = [
            'Yes, absolutely!', 'No way, José!', 'Maybe, maybe not...', 'Definitely not!', 'You betcha!',
            'Ask me again later, I\'m feeling indecisive.', 'Signs point to yes! ✨', 'Reply hazy, try again later 🔮',
            'Without a doubt! 💯', 'My sources say no 🤫', 'Most likely! 👍', 'Outlook not so good... 😔',
            'It is certain! 🌠', 'Cannot predict now 🤷', 'Better not tell you now... 🤐',
            'Concentrate and ask again 🤔', 'Don\'t count on it 👎', 'Very doubtful... 🤨'
        ];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

        const decisionText = `
╭• ─────────── 🎱 ─────────── •╮
┊ 🤔 Your Question: ${question}
╰• ─────────── 🎱 ─────────── •╯

╭─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╮
┊ ✨ The Magic 8-Ball Says: ✨
┊       ${randomAnswer} 
╰─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───╯
`;

        await sock.sendMessage(m.key.remoteJid, { text: decisionText }, { quoted: m });
    }
};

async function safetyJs(text, sock, m) {
    try {
        // Filter for bad words
        if (settings.deleteBadWords) {
            const hasBadWord = settings.blockedKeywords.some(word => 
                text.toLowerCase().includes(word.toLowerCase())
            );

            if (hasBadWord) {
                console.log('Deleting message with bad word:', text);
                await sock.sendMessage(m.key.remoteJid, { delete: m.key }); // Delete the message
            }
        }
    } catch (error) {
        console.error('Error in safetyJs:', error);
    }
}

module.exports = { safetyJs }
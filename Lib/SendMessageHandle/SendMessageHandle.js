const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendMessageHandle(sock) {
    if (!sock) {
        throw new Error("Socket not provided");
    }

    try {
        if (!global.hacxk) {
            global.hacxk = {
                reply: async (text, m) => {
                    try {
                        if (!m || !m.key) {
                            throw new Error("Message object or key is not available");
                        }
                        if (m.key.remoteJid.endsWith('@newsletter')) {
                            await sock.sendMessage(m.key.remoteJid, { text: text });
                        } else {
                            await sock.readMessages([m.key]);
                            await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                            const message = sock.sendMessage(m.key.remoteJid, { text: text }, { quoted: m });
                            await sock.sendPresenceUpdate('available', m.key.remoteJid); // Remove delay(500);
                            return message;
                        }
                    } catch (error) {
                        console.error("Failed to send reply:", error);
                        throw error;
                    }
                },

                react: async (emoji, m) => {
                    try {
                        if (!m || !m.key || !emoji) {
                            throw new Error("Message object or key or Emoji is not available");
                        }
                        await sock.readMessages([m.key]);
                        await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                        const message = await sock.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
                        await sock.sendPresenceUpdate('available', m.key.remoteJid);
                        return message;
                    } catch (error) {
                        console.error("Failed to send Reaction:", error);
                        throw error;
                    }
                },

                Image: async (imageBuffer, m, caption) => {
                    try {
                        if (!imageBuffer || !m || !m.key) {
                            throw new Error("Image buffer, message object, or key is not available");
                        }

                        await sock.readMessages([m.key]);
                        await sock.sendPresenceUpdate('composing', m.key.remoteJid);
                        const message = await sock.sendMessage(m.key.remoteJid, { image: imageBuffer, caption: caption }, { quoted: m });
                        await sock.sendPresenceUpdate('available', m.key.remoteJid);
                        return message;
                    } catch (error) {
                        console.error("Failed to send image:", error);
                        throw error;
                    }
                },

                Audio: async (audioBuffer, m) => {
                    try {
                        if (!audioBuffer || !m || !m.key) {
                            throw new Error("Audio buffer, message object, or key is not available");
                        }

                        await sock.readMessages([m.key]);
                        await sock.sendPresenceUpdate('recording', m.key.remoteJid);
                        const message = await sock.sendMessage(m.key.remoteJid, { audio: audioBuffer, mimetype: 'audio/mp4' }, { quoted: m });
                        await sock.sendPresenceUpdate('available', m.key.remoteJid);
                        return message;
                    } catch (error) {
                        console.error("Failed to send audio:", error);
                        throw error;
                    }
                }
            };
        }
    } catch (error) {
        console.error("Error initializing global send object:", error);
        throw error;
    }
}

module.exports = { sendMessageHandle };

const { safetyJs } = require('./SafetyJS')

async function handleMessage(m, sock) {
    try {
        if (!m.message) {
            console.log('\x1b[90m%s\x1b[0m', 'Non-message type:', m); // Gray color for non-message types
            return;
        }

        const messageType = Object.keys(m.message)[0];
        const messageContent = m.message[messageType];

        switch (messageType) {
            case 'extendedTextMessage':
                handleTextMessage(messageContent);
                safetyJs(messageContent.text, sock, m);
                break;
            case 'conversation':
                handleConversationMessage(messageContent);
                safetyJs(messageContent, sock, m);
                break;
            case 'imageMessage':
                handleImageMessage(messageContent);
                break;
            case 'videoMessage':
                handleVideoMessage(messageContent);
                break;
            case 'locationMessage':
                handleLocationMessage(messageContent);
                break;
            case 'stickerMessage':
                handleStickerMessage(messageContent);
                break;
            case 'documentMessage':
                handleDocumentMessage(messageContent);
                break;
            case 'documentWithCaptionMessage':
                documentWithCaptionMessage(messageContent);
                break;
            case 'audioMessage':
                handleAudioMessage(messageContent);
                break;
            case 'vcardMessage':
                handleVCardMessage(messageContent);
                break;
            case 'reactionMessage':
                handleReactionMessage(messageContent);
                break;
            case 'pollCreationMessage':
                handlePollCreationMessage(messageContent);
                break;
            default:
                console.log('\x1b[33m%s\x1b[0m', `Unknown message type: ${messageType}`); // Yellow color for unknown message types
                console.log(JSON.stringify(m))
        }
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error handling message:', error); // Red color for error messages
    }
}

function handleTextMessage(message) {
    const text = message.text.toLowerCase();
    console.log('\x1b[32m%s\x1b[0m', `🔤 Text message: ${text} `); // Green color for text messages
    // Implement your logic for handling text messages
}

function handleConversationMessage(message) {
    const conversation = message.toLowerCase();
    console.log('\x1b[36m%s\x1b[0m', `💬 Conversation message: ${conversation} `); // Cyan color for conversation messages
    // Implement your logic for handling conversation messages
}

function handleImageMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `🖼️ Image message:`, message, ''); // Magenta color for image messages
    // Implement your logic for handling image messages
}

function handleVideoMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `🎥 Video message:`, message, ''); // Magenta color for video messages
    // Implement your logic for handling video messages
}

function handleLocationMessage(message) {
    console.log('\x1b[34m%s\x1b[0m', `📍 Location message:`, message, ''); // Blue color for location messages
    // Implement your logic for handling location messages
}

function handleStickerMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `🎨 Sticker message:`, message, ''); // Magenta color for sticker messages
    // Implement your logic for handling sticker messages
}

function handleDocumentMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `📄 Document message:`, message, ''); // Magenta color for document messages
    // Implement your logic for handling document messages
}

function handleAudioMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `🔊 Audio message:`, message, ''); // Magenta color for audio messages
    // Implement your logic for handling audio messages
}

function handleVCardMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `📇 VCard message:`, message, ''); // Magenta color for vCard messages
    // Implement your logic for handling vCard messages
}

function handleReactionMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `👍 Reaction message:`, message, ''); // Magenta color for vCard messages
    // Implement your logic for handling vCard messages
}

function handlePollCreationMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `📊 Poll Creation message:`, message, ''); // Magenta color for vCard messages
    // Implement your logic for handling vCard messages
}

function documentWithCaptionMessage(message) {
    console.log('\x1b[35m%s\x1b[0m', `📄 document With Caption message:`, message.message.documentMessage, ''); // Magenta color for vCard messages
    // Implement your logic for handling vCard messages
}

module.exports = { handleMessage };

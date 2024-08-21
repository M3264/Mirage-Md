global.settings = {
  botName: 'MIRAGE',
  ownerNames: ['Miracle'], // Array of owner names/usernames
  ownerNumbers: ['2347013159244', '2347034313883'], // Array of owner phone numbers (with country code)
  workMode: 'Public',

  maxDownloadSize: 50, // 50 MB download limit in bytes
  blockedKeywords: ['', '', ''], // Add more keywords as needed
  deleteBadWords: false, // Enable/disable bad word deletion
  isHackEnable: true,
  isAdultSearchEnable: false,
  rejectCalls: true,

  antiCheckers: {
    antiCallRejecter: true,
    antiSpamHandler: false,
    sendWelcome: false,
  },

  // Other settings...
  defaultLanguage: 'en',
  defaultTimezone: 'Africa/Lagos',

  typingDelay: { // this configuration to determine how long to wait before sending the message this shows typing... mark
    min: 400, // Minimum delay in milliseconds
    max: 800, // Maximum delay in milliseconds
    longMessageThreshold: 300, // Characters
  },
  // Text-to-Speech Settings
  tts: {
    defaultLanguage: 'en',       // Default language code (e.g., 'en', 'es', 'fr')
    defaultSpeed: false,         // Default speaking speed (false for normal, true for slow)
    maxChars: 200,               // Max Letters to Say
  },

  botMenuTitle: 'M I R A G E',
  // Additional Settings (customize as needed)
  autoReadMessages: true, // Automatically mark messages as read
  welcomeMessage: 'Hello! How can I help you today?',
  goodbyeMessage: 'Goodbye! Have a great day!',

  // API KEY
  giphyAPIKey: '',


};
module.exports = {
    event: ['call'],
    desc: 'Reject Whatsapp Call Comming to Bot!',
    isEnabled: settings.antiCheckers.antiCallRejecter,
    async execute(sock, data) {
      const { from } = data;
      const delay = 2000; // 1000 milliseconds (1 second) delay
  
      setTimeout(async () => {
        await sock.rejectCall(data.id, from);
      }, delay);
    }
  };
  
const { getChannel } = require('../utils/rabbitmq');

const sendWelcomeEmailJob = async (email, firstName) => {
  const channel = getChannel();

  const message = {
    type: 'WELCOME_EMAIL',
    to: email,
    firstName
  };

  channel.sendToQueue(
    process.env.RABBITMQ_EMAIL_QUEUE,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true
    }
  );
};

module.exports = {
  sendWelcomeEmailJob
};
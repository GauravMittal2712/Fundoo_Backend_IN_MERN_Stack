const { publish } = require('../utils/rabbitmq');

// Resolves once RabbitMQ has confirmed the job is safely stored in the queue.
const enqueue = (message) =>
  publish(process.env.RABBITMQ_EMAIL_QUEUE, Buffer.from(JSON.stringify(message)));

const sendWelcomeEmailJob = async (email, firstName) =>
  enqueue({
    type: 'WELCOME_EMAIL',
    to: email,
    firstName
  });

const sendResetPasswordEmailJob = async (email, firstName, resetUrl) =>
  enqueue({
    type: 'RESET_PASSWORD_EMAIL',
    to: email,
    firstName,
    resetUrl
  });

const sendCollaboratorAddedEmailJob = async ({ to, collaboratorName, ownerName, noteTitle, noteUrl }) =>
  enqueue({
    type: 'COLLABORATOR_ADDED_EMAIL',
    to,
    collaboratorName,
    ownerName,
    noteTitle,
    noteUrl
  });

const sendReminderEmailJob = async ({ to, firstName, noteTitle, noteDescription, dateTime, noteUrl }) =>
  enqueue({
    type: 'REMINDER_EMAIL',
    to,
    firstName,
    noteTitle,
    noteDescription,
    dateTime,
    noteUrl
  });

module.exports = {
  sendWelcomeEmailJob,
  sendResetPasswordEmailJob,
  sendCollaboratorAddedEmailJob,
  sendReminderEmailJob
};

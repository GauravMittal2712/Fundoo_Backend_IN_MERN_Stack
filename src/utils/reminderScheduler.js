const Note = require('../models/note.model');
const logger = require('./logger');
const { sendReminderEmailJob } = require('../services/email.service');

const CHECK_INTERVAL_MS = 60 * 1000; // look for due reminders every minute

let timer = null;
let running = false;

// Atomically flips emailSent to true for ONE due note and returns it.
// If two server instances run this at once, only one gets the note, so no double emails.
const claimNextDueNote = () =>
  Note.findOneAndUpdate(
    {
      'reminder.dateTime': { $lte: new Date() },
      'reminder.status': 'pending',
      'reminder.emailSent': { $ne: true },
      isTrashed: false
    },
    { $set: { 'reminder.emailSent': true } },
    { new: true }
  ).populate('userId', 'firstName email');

const processDueReminders = async () => {
  if (running) return; // previous tick still busy
  running = true;

  try {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    let note;
    while ((note = await claimNextDueNote())) {
      const user = note.userId;
      if (!user?.email) continue;

      try {
        await sendReminderEmailJob({
          to: user.email,
          firstName: user.firstName,
          noteTitle: note.title,
          noteDescription: note.description,
          dateTime: note.reminder.dateTime,
          noteUrl: `${clientUrl}/reminders`
        });
      } catch (error) {
        // Queueing failed, so release the claim and retry on the next tick.
        await Note.updateOne({ _id: note._id }, { $set: { 'reminder.emailSent': false } });
        logger.error(`Could not queue reminder email for note ${note._id}: ${error.message}`);
        break;
      }
    }
  } catch (error) {
    logger.error(`Reminder scheduler error: ${error.message}`);
  } finally {
    running = false;
  }
};

const startReminderScheduler = () => {
  if (timer) return;
  processDueReminders();
  timer = setInterval(processDueReminders, CHECK_INTERVAL_MS);
  logger.info('Reminder scheduler started');
};

const stopReminderScheduler = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

module.exports = { startReminderScheduler, stopReminderScheduler };

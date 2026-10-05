const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
  // Without these a hung connection could freeze the worker for minutes
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000
});

// Used by the worker at start-up to log whether the Gmail login works.
const verifyMailer = async () => {
  try {
    await transporter.verify();
    logger.info('SMTP connection verified');
    return true;
  } catch (error) {
    logger.error(`SMTP check failed (is MAIL_USER / MAIL_PASSWORD correct?): ${error.message}`);
    return false;
  }
};

const sendWelcomeEmail = async (to, firstName) => {
  try {
    await transporter.sendMail({
      from: `"Fundoo App" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Welcome to Fundoo!',
      text: `Hello ${firstName},

Welcome to Fundoo!

Your account has been successfully registered.

Thank you for joining us.
If you want a proper message use Google keep not this because this is under progress and not a final product.

Regards,
Fundoo Team`
    });

    logger.info(`Welcome email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${to}: ${error.message}`);
    throw error;
  }
};

const sendResetPasswordEmail = async (to, firstName, resetUrl) => {
  try {
    await transporter.sendMail({
      from: `"Fundoo App" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Reset your Fundoo password',
      text: `Hello ${firstName},

We received a request to reset your Fundoo password.

Open this link to choose a new password (valid for 15 minutes):
${resetUrl}

If you didn't request this, you can safely ignore this email.

Regards,
Fundoo Team`,
      html: `<p>Hello ${firstName},</p>
<p>We received a request to reset your Fundoo password.</p>
<p><a href="${resetUrl}" style="background:#1a73e8;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">Reset password</a></p>
<p>Or copy this link into your browser (valid for 15 minutes):<br>${resetUrl}</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Regards,<br>Fundoo Team</p>`
    });

    logger.info(`Password reset email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
    throw error;
  }
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const sendCollaboratorAddedEmail = async (to, collaboratorName, ownerName, noteTitle, noteUrl) => {
  try {
    await transporter.sendMail({
      from: `"Fundoo App" <${process.env.MAIL_USER}>`,
      to,
      subject: `${ownerName} shared a note with you on Fundoo`,
      text: `Hello ${collaboratorName},

${ownerName} added you as a collaborator on the note "${noteTitle}".

Open Fundoo to view it under "Shared with you":
${noteUrl}

Regards,
Fundoo Team`,
      html: `<p>Hello ${escapeHtml(collaboratorName)},</p>
<p><strong>${escapeHtml(ownerName)}</strong> added you as a collaborator on the note <strong>"${escapeHtml(noteTitle)}"</strong>.</p>
<p><a href="${escapeHtml(noteUrl)}" style="background:#1a73e8;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">Open Fundoo</a></p>
<p>Regards,<br>Fundoo Team</p>`
    });

    logger.info(`Collaborator email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send collaborator email to ${to}: ${error.message}`);
    throw error;
  }
};

const sendReminderEmail = async (to, firstName, noteTitle, noteDescription, dateTime, noteUrl) => {
  const when = new Date(dateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const preview = (noteDescription || '').slice(0, 300);

  try {
    await transporter.sendMail({
      from: `"Fundoo App" <${process.env.MAIL_USER}>`,
      to,
      subject: `Reminder: ${noteTitle}`,
      text: `Hello ${firstName},

This is your reminder for the note "${noteTitle}" (set for ${when} IST).
${preview ? `\n${preview}\n` : ''}${noteUrl ? `\nOpen your reminders: ${noteUrl}\n` : ''}
Regards,
Fundoo Team`,
      html: `<p>Hello ${escapeHtml(firstName)},</p>
<p>This is your reminder for the note <strong>"${escapeHtml(noteTitle)}"</strong> (set for ${escapeHtml(when)} IST).</p>
${preview ? `<blockquote style="border-left:3px solid #dadce0;margin:0;padding-left:12px;color:#5f6368">${escapeHtml(preview)}</blockquote>` : ''}
${noteUrl ? `<p><a href="${escapeHtml(noteUrl)}" style="background:#1a73e8;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">Open Fundoo</a></p>` : ''}
<p>Regards,<br>Fundoo Team</p>`
    });

    logger.info(`Reminder email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send reminder email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendCollaboratorAddedEmail,
  sendReminderEmail,
  verifyMailer
};
const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

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

module.exports = { sendWelcomeEmail };
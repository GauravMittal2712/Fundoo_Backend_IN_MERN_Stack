const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');
const { deleteCache } = require('../utils/cache');
const { sendWelcomeEmailJob, sendResetPasswordEmailJob } = require('./email.service');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (data) => {
  const existing = await userRepo.findByEmail(data.email);

  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await userRepo.create({
    ...data,
    password: hashed
  });

  try {
    await sendWelcomeEmailJob(
      user.email,
      user.firstName
    );
  } catch (error) {
    // The account already exists, so a mail-queue problem must not make sign-up look failed.
    logger.error(`Could not queue welcome email for ${user.email}: ${error.message}`);
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
};

const login = async (email, password) => {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Google-only accounts have no password to compare against
  if (!user.password) {
    throw new ApiError(401, 'This account uses Google sign-in. Use "Continue with Google", or reset your password to also log in with one.');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  };
};

const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);

  // Do nothing (silently) for unknown emails so attackers can't discover accounts.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  await userRepo.setResetToken(
    user._id,
    hashToken(rawToken),
    new Date(Date.now() + RESET_TOKEN_TTL_MS)
  );

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

  try {
    await sendResetPasswordEmailJob(user.email, user.firstName, resetUrl);
  } catch (error) {
    // Keep the response identical for every email; the error is visible in the logs.
    logger.error(`Could not queue password reset email for ${user.email}: ${error.message}`);
  }
};

const resetPassword = async (token, newPassword) => {
  const user = await userRepo.findByResetToken(hashToken(token));

  if (!user) {
    throw new ApiError(400, 'Reset link is invalid or has expired');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepo.updatePassword(user._id, hashed);
};

// ---------- Google OAuth ----------
let googleClient;

const verifyGoogleCredential = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new ApiError(503, 'Google sign-in is not configured on the server');
  }

  googleClient = googleClient || new OAuth2Client(clientId);

  try {
    // Checks signature, expiry and that the token was issued for OUR client id
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    return ticket.getPayload();
  } catch (error) {
    logger.warn(`Google credential rejected: ${error.message}`);
    throw new ApiError(401, 'Invalid or expired Google credential');
  }
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const googleLogin = async (credential) => {
  const payload = await verifyGoogleCredential(credential);

  if (!payload.email || !payload.email_verified) {
    throw new ApiError(401, 'Your Google email address is not verified');
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const picture = payload.picture || '';

  // 1) Returning Google user  2) existing email/password user  3) brand new user
  let user = await userRepo.findByGoogleId(googleId);

  if (!user) {
    user = await userRepo.findByEmailForOAuth(email);

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        throw new ApiError(409, 'This email is already linked to a different Google account');
      }
      // Same verified email -> link Google to the existing account (notes stay intact)
      await userRepo.linkGoogleAccount(user._id, googleId, user.profileImage ? '' : picture);
      await deleteCache(`profile:${user._id}`).catch(() => {});
    } else {
      const fallbackName = email.split('@')[0];
      const firstName = payload.given_name || payload.name || fallbackName;
      const lastName =
        payload.family_name ||
        (payload.name && payload.name.split(' ').slice(1).join(' ')) ||
        '-';

      try {
        user = await userRepo.create({ firstName, lastName, email, googleId, profileImage: picture });
      } catch (error) {
        // Two simultaneous first-time logins: the other request won, so just use its user
        if (error.code === 11000) {
          user = await userRepo.findByGoogleId(googleId);
        }
        if (!user) throw error;
      }

      try {
        await sendWelcomeEmailJob(user.email, user.firstName);
      } catch (error) {
        // A queue problem must never block sign-in
        logger.error(`Could not queue welcome email for ${user.email}: ${error.message}`);
      }
    }
  }

  return {
    token: signToken(user._id),
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImage: user.profileImage || picture
    }
  };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyGoogleCredential
};
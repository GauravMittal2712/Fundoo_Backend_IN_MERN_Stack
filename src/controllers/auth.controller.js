const authService = require('../services/auth.service');
const messages = require('../constants/messages');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: messages.USER_REGISTERED,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);   
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({
      success: true,
      message: messages.LOGIN_SUCCESS,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Same response whether or not the email exists (prevents account enumeration)
    res.status(200).json({
      success: true,
      message: messages.PASSWORD_RESET_EMAIL_SENT,
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
      success: true,
      message: messages.PASSWORD_RESET_SUCCESS,
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.body.credential);
    res.status(200).json({
      success: true,
      message: messages.LOGIN_SUCCESS,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword, googleLogin };
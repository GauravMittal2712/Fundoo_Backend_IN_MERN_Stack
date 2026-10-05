const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: function () { return !this.googleId; }, minlength: 6 },
    googleId: { type: String, unique: true, sparse: true, select: false },
    profileImage: { type: String, default: '' },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
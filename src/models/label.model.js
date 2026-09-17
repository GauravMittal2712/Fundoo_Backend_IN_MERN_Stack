const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    }
  },
  { timestamps: true }
);

labelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);
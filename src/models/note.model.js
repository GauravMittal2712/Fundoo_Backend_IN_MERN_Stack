const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#ffffff' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
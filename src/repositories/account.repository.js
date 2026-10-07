const User = require('../models/user.model');
const Note = require('../models/note.model');
const Label = require('../models/label.model');
const Collaborator = require('../models/collaborator.model');

const findForDeletion = (id) => User.findById(id).select('+password +googleId');

const deleteAllForUser = async (userId) => {
  const ownedNoteIds = (await Note.find({ userId }).select('_id').lean()).map((n) => n._id);

  // collaborations on their notes, collaborations they were invited to, and ones they created
  await Collaborator.deleteMany({
    $or: [{ noteId: { $in: ownedNoteIds } }, { userId }, { addedBy: userId }]
  });
  await Note.deleteMany({ userId });
  await Label.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
};

module.exports = { findForDeletion, deleteAllForUser };

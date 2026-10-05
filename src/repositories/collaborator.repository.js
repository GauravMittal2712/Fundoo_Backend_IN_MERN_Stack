const Collaborator = require('../models/collaborator.model');
const Note = require('../models/note.model');
const User = require('../models/user.model');

const add = async (noteId, email, addedBy) => {
  const user = await User.findOne({ email });
  if (!user) return null;

  if (String(user._id) === String(addedBy)) {
    const error = new Error('You are the owner of this note, so you cannot add yourself as a collaborator');
    error.statusCode = 400;
    throw error;
  }

  const note = await Note.findOne({ _id: noteId, userId: addedBy });
  if (!note) return null;

  return Collaborator.create({
    noteId,
    userId: user._id,
    email: user.email,
    addedBy
  });
};

// Names and note title needed to write the "you were added" email.
const getEmailContext = async (noteId, ownerId, collaboratorUserId) => {
  const [note, owner, collaborator] = await Promise.all([
    Note.findById(noteId).select('title'),
    User.findById(ownerId).select('firstName lastName'),
    User.findById(collaboratorUserId).select('firstName email')
  ]);
  return { note, owner, collaborator };
};

const findByNote = (noteId) =>
  Collaborator.find({ noteId })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });

const findById = (id) => Collaborator.findById(id);

const findByNoteAndEmail = (noteId, email) =>
  Collaborator.findOne({ noteId, email: email.toLowerCase() });

const removeById = (id) => Collaborator.findByIdAndDelete(id);

const removeByNoteAndEmail = (noteId, email) =>
  Collaborator.findOneAndDelete({ noteId, email: email.toLowerCase() });

const getSharedNotes = (userId) =>
  Collaborator.find({ userId })
    .populate({
      path: 'noteId',
      populate: { path: 'labels', select: 'name' }
    })
    .sort({ createdAt: -1 });

const isNoteOwner = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, userId });
  return !!note;
};

const isCollaborator = async (noteId, userId) => {
  const collab = await Collaborator.findOne({ noteId, userId });
  return !!collab;
};

module.exports = {
  add,
  getEmailContext,
  findByNote,
  findById,
  findByNoteAndEmail,
  removeById,
  removeByNoteAndEmail,
  getSharedNotes,
  isNoteOwner,
  isCollaborator
};
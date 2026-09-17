const noteRepo = require('../repositories/note.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const createNote = async (userId, data) => noteRepo.create({ ...data, userId });

const getNotes = async (userId, type = 'active') => {
  const filter = { isTrashed: false };

  if (type === 'archived') {
    filter.isArchived = true;
  } else if (type === 'trash') {
    filter.isTrashed = true;
    delete filter.isArchived;
  } else {
    filter.isArchived = false;
  }

  return noteRepo.findByUser(userId, filter);
};

const getNoteById = async (id, userId) => {
  // ★ Now allows owner OR collaborator
  const note = await noteRepo.findByIdForUser(id, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const updateNote = async (id, userId, data) => {
  // ★ Now allows owner OR collaborator
  const note = await noteRepo.updateByIdForUser(id, userId, data);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const deleteNote = async (id, userId) => {
  // Only owner can permanently delete
  const note = await noteRepo.deleteById(id, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const archiveNote = async (id, userId) => {
  return updateNote(id, userId, { isArchived: true, isTrashed: false });
};

const trashNote = async (id, userId) => {
  return updateNote(id, userId, { isTrashed: true, isArchived: false });
};

const restoreNote = async (id, userId) => {
  return updateNote(id, userId, { isTrashed: false, isArchived: false });
};

const searchNotes = async (userId, q) => {
  if (!q) return [];
  return noteRepo.search(userId, q);
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  archiveNote,
  trashNote,
  restoreNote,
  searchNotes
};
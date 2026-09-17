const noteRepo = require('../repositories/note.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const { getCache, setCache, deleteCacheByPattern } = require('../utils/cache');

const createNote = async (userId, data) => noteRepo.create({ ...data, userId });

const getNotes = async (userId, type = 'active') => {
  const cacheKey = `notes:${userId}:${type}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }
  const filter = { isTrashed: false };

  if (type === 'archived') {
    filter.isArchived = true;
  } else if (type === 'trash') {
    filter.isTrashed = true;
    delete filter.isArchived;
  } else {
    filter.isArchived = false;
  }

  const notes = await noteRepo.findByUser(userId, filter);

  // 3. Store in cache
  await setCache(cacheKey, notes);

  return notes;
};

const clearNotesCache = async (userId) => {
  await deleteCacheByPattern(`notes:${userId}:*`);
};

const getNoteById = async (id, userId) => {
  const note = await noteRepo.findByIdForUser(id, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const updateNote = async (id, userId, data) => {
  const note = await noteRepo.updateByIdForUser(id, userId, data);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  await clearNotesCache(userId);
  return note;
};

const deleteNote = async (id, userId) => {
  const note = await noteRepo.deleteById(id, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  await clearNotesCache(userId);
  return note;
};

const archiveNote = async (id, userId) => {
  await clearNotesCache(userId);
  return updateNote(id, userId, { isArchived: true, isTrashed: false });
  
};

const trashNote = async (id, userId) => {
  await clearNotesCache(userId);
  return updateNote(id, userId, { isTrashed: true, isArchived: false });
};

const restoreNote = async (id, userId) => {
  await clearNotesCache(userId);
  return updateNote(id, userId, { isTrashed: false, isArchived: false });
};

const searchNotes = async (userId, q) => {
  if (!q) return [];
  return noteRepo.search(userId, q);
};

const setReminder = async (noteId, userId, dateTime) => {
  const note = await noteRepo.setReminder(noteId, userId, {
    dateTime: new Date(dateTime),
    status: 'pending'
  });
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};


const getReminder = async (noteId, userId) => {
  const note = await noteRepo.findByIdForUser(noteId, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note.reminder || null;
};

const removeReminder = async (noteId, userId) => {
  const note = await noteRepo.removeReminder(noteId, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const getNotesWithReminders = async (userId) => {
  return noteRepo.getNotesWithReminders(userId);
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
  searchNotes,
  setReminder,
  getReminder,
  removeReminder,
  getNotesWithReminders
};
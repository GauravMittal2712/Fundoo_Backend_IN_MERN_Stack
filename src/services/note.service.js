const noteRepo = require('../repositories/note.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const { getCache, setCache, deleteCacheByPattern } = require('../utils/cache');

const clearNotesCache = async (userId) => {
  await deleteCacheByPattern(`notes:${userId}:*`);
};

// FIX 1: clear the cache after creating a note
const createNote = async (userId, data) => {
  const note = await noteRepo.create({ ...data, userId });
  await clearNotesCache(userId);
  return note;
};

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

  await setCache(cacheKey, notes);

  return notes;
};

const getNoteById = async (id, userId) => {
  const note = await noteRepo.findByIdForUser(id, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

// What a collaborator may change on a shared note. Everything else is owner-only.
const COLLABORATOR_EDITABLE_FIELDS = ['title', 'description', 'color'];

// Not the owner: a collaborator gets a clear 403, anyone else a plain 404.
const rejectNonOwner = async (id, userId, action) => {
  if (await noteRepo.isCollaborator(id, userId)) {
    throw new ApiError(403, `Only the note owner can ${action} this note`);
  }
  throw new ApiError(404, messages.NOT_FOUND);
};

// Owner-only change (archive, trash, restore ...)
const updateOwnedNote = async (id, userId, data, action) => {
  const note = await noteRepo.updateById(id, userId, data);
  if (!note) return rejectNonOwner(id, userId, action);
  await clearNotesCache(userId);
  return note;
};

// The owner can change anything; a collaborator can only edit title, description and colour.
const updateNote = async (id, userId, data) => {
  const owned = await noteRepo.updateById(id, userId, data);
  if (owned) {
    await clearNotesCache(userId);
    return owned;
  }

  if (!(await noteRepo.isCollaborator(id, userId))) {
    throw new ApiError(404, messages.NOT_FOUND);
  }

  const blocked = Object.keys(data).filter((key) => !COLLABORATOR_EDITABLE_FIELDS.includes(key));
  if (blocked.length > 0) {
    throw new ApiError(403, 'Collaborators can only edit the title, description and colour of a shared note');
  }

  const edited = await noteRepo.updateSharedContent(id, data);
  if (!edited) throw new ApiError(404, messages.NOT_FOUND);

  // Clear the OWNER's cached lists too, or they would show the old text for up to 5 minutes.
  await clearNotesCache(userId);
  await clearNotesCache(edited.userId);
  return edited;
};

const deleteNote = async (id, userId) => {
  const note = await noteRepo.deleteById(id, userId);
  if (!note) return rejectNonOwner(id, userId, 'delete');
  await clearNotesCache(userId);
  return note;
};

const archiveNote = async (id, userId) => {
  return updateOwnedNote(id, userId, { isArchived: true, isTrashed: false }, 'archive');
};

const trashNote = async (id, userId) => {
  return updateOwnedNote(id, userId, { isTrashed: true, isArchived: false }, 'delete');
};

const restoreNote = async (id, userId) => {
  return updateOwnedNote(id, userId, { isTrashed: false, isArchived: false }, 'restore');
};

const searchNotes = async (userId, q) => {
  if (!q) return [];
  return noteRepo.search(userId, q);
};

// FIX 2: clear the cache after setting a reminder
const setReminder = async (noteId, userId, dateTime) => {
  const note = await noteRepo.setReminder(noteId, userId, {
    dateTime: new Date(dateTime),
    status: 'pending',
    emailSent: false
  });
  if (!note) return rejectNonOwner(noteId, userId, 'set reminders on');
  await clearNotesCache(userId);
  return note;
};

const getReminder = async (noteId, userId) => {
  const note = await noteRepo.findByIdForUser(noteId, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note.reminder || null;
};

// FIX 3: clear the cache after removing a reminder
const removeReminder = async (noteId, userId) => {
  const note = await noteRepo.removeReminder(noteId, userId);
  if (!note) return rejectNonOwner(noteId, userId, 'remove reminders from');
  await clearNotesCache(userId);
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
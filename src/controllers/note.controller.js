const noteService = require('../services/note.service');
const messages = require('../constants/messages');

const create = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: messages.NOTE_CREATED,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const type = req.query.type || 'active';
    const notes = await noteService.getNotes(req.user.id, type);
    res.status(200).json({
      success: true,
      message: 'Notes fetched',
      data: notes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Note fetched',
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: messages.NOTE_UPDATED,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: messages.NOTE_DELETED,
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const archive = async (req, res, next) => {
  try {
    const note = await noteService.archiveNote(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: messages.NOTE_ARCHIVED,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const trash = async (req, res, next) => {
  try {
    const note = await noteService.trashNote(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: messages.NOTE_TRASHED,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const restore = async (req, res, next) => {
  try {
    const note = await noteService.restoreNote(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: messages.NOTE_RESTORED,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    const notes = await noteService.searchNotes(req.user.id, req.query.q);
    res.status(200).json({
      success: true,
      message: 'Search results',
      data: notes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};
const setReminder = async (req, res, next) => {
  try {
    const note = await noteService.setReminder(
      req.params.noteId,
      req.user.id,
      req.body.dateTime
    );
    res.status(200).json({
      success: true,
      message: 'Reminder set successfully',
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getReminder = async (req, res, next) => {
  try {
    const reminder = await noteService.getReminder(req.params.noteId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Reminder fetched',
      data: reminder,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};
const removeReminder = async (req, res, next) => {
  try {
    const note = await noteService.removeReminder(req.params.noteId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Reminder removed successfully',
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// ★ NEW: Get all notes with reminders
const getNotesWithReminders = async (req, res, next) => {
  try {
    const notes = await noteService.getNotesWithReminders(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notes with reminders fetched',
      data: notes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  archive,
  trash,
  restore,
  search,
  setReminder,
  getReminder,
  removeReminder,
  getNotesWithReminders
};
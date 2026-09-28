const Note = require('../models/note.model');
const Collaborator = require('../models/collaborator.model');

const create = (data) => Note.create(data);

const findByUser = (userId, filter = {}) =>
  Note.find({ userId, ...filter })
    .populate('labels', 'name')
    .sort({ isPinned: -1, updatedAt: -1 });

const findByIdAndUser = (id, userId) =>
  Note.findOne({ _id: id, userId }).populate('labels', 'name');

const findByIdForUser = async (id, userId) => {
  let note = await Note.findOne({ _id: id, userId }).populate('labels', 'name');
  if (note) return note;

  const collab = await Collaborator.findOne({ noteId: id, userId });
  if (!collab) return null;

  return Note.findById(id).populate('labels', 'name');
};

const updateById = (id, userId, data) =>
  Note.findOneAndUpdate({ _id: id, userId }, data, { new: true }).populate('labels', 'name');

const updateByIdForUser = async (id, userId, data) => {
  let note = await Note.findOneAndUpdate(
    { _id: id, userId },
    data,
    { new: true }
  ).populate('labels', 'name');

  if (note) return note;

  const collab = await Collaborator.findOne({ noteId: id, userId });
  if (!collab) return null;

  return Note.findByIdAndUpdate(id, data, { new: true }).populate('labels', 'name');
};

const deleteById = (id, userId) =>
  Note.findOneAndDelete({ _id: id, userId });

const search = (userId, query) =>
  Note.find({
    userId,
    isTrashed: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  })
    .populate('labels', 'name')
    .sort({ updatedAt: -1 });


const setReminder = async (id, userId, reminderData) => {
  return updateByIdForUser(id, userId, { reminder: reminderData });
};

const removeReminder = async (id, userId) => {
  return updateByIdForUser(id, userId, { $unset: { reminder: 1 } });
};


const getNotesWithReminders = (userId) =>
  Note.find({
    userId,
    'reminder.dateTime': { $exists: true },
    'reminder.status': 'pending',
    isTrashed: false
  })
    .populate('labels', 'name')
    .sort({ 'reminder.dateTime': 1 });

module.exports = {
  create,
  findByUser,
  findByIdAndUser,
  findByIdForUser,
  updateById,
  updateByIdForUser,
  deleteById,
  search,
  setReminder,
  removeReminder,
  getNotesWithReminders
};
const Label = require('../models/label.model');
const Note = require('../models/note.model');

const create = (data) => Label.create(data);
const findByUser = (userId) => Label.find({ userId }).sort({ name: 1 });
const findByIdAndUser = (id, userId) => Label.findOne({ _id: id, userId });
const updateById = (id, userId, data) =>
  Label.findOneAndUpdate({ _id: id, userId }, data, { new: true });
const deleteById = (id, userId) => Label.findOneAndDelete({ _id: id, userId });

const addLabelToNote = async (labelId, noteId, userId) => {
  const label = await Label.findOne({ _id: labelId, userId });
  if (!label) return null;

  return Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $addToSet: { labels: labelId } },
    { new: true }
  ).populate('labels', 'name');
};

const removeLabelFromNote = async (labelId, noteId, userId) => {
  return Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $pull: { labels: labelId } },
    { new: true }
  ).populate('labels', 'name');
};

const getNotesByLabel = (labelId, userId) =>
  Note.find({ userId, labels: labelId, isTrashed: false })
    .populate('labels', 'name')
    .sort({ isPinned: -1, updatedAt: -1 });

// ★ NEW: Remove label from all notes when label is deleted
const removeLabelFromAllNotes = (labelId, userId) =>
  Note.updateMany(
    { userId, labels: labelId },
    { $pull: { labels: labelId } }
  );

module.exports = {
  create,
  findByUser,
  findByIdAndUser,
  updateById,
  deleteById,
  addLabelToNote,
  removeLabelFromNote,
  getNotesByLabel,
  removeLabelFromAllNotes
};
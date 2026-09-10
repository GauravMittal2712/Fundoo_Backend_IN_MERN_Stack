const Note = require('../models/note.model');

const create = (data) => Note.create(data);
const findByUser = (userId, filter = {}) => Note.find({ userId, ...filter }).sort({ isPinned: -1, updatedAt: -1 });
const findByIdAndUser = (id, userId) => Note.findOne({ _id: id, userId });
const updateById = (id, userId, data) => Note.findOneAndUpdate({ _id: id, userId }, data, { new: true });
const deleteById = (id, userId) => Note.findOneAndDelete({ _id: id, userId });
const search = (userId, query) =>
  Note.find({
    userId,
    isTrashed: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  }).sort({ updatedAt: -1 });

module.exports = { create, findByUser, findByIdAndUser, updateById, deleteById, search };
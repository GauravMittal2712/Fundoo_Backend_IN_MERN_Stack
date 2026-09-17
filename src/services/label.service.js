const labelRepo = require('../repositories/label.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const createLabel = async (userId, name) => {
  try {
    return await labelRepo.create({ userId, name });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'Label with this name already exists');
    }
    throw err;
  }
};

const getLabels = (userId) => labelRepo.findByUser(userId);

const updateLabel = async (labelId, userId, name) => {
  const label = await labelRepo.updateById(labelId, userId, { name });
  if (!label) throw new ApiError(404, messages.NOT_FOUND);
  return label;
};

const deleteLabel = async (labelId, userId) => {
  const label = await labelRepo.deleteById(labelId, userId);
  if (!label) throw new ApiError(404, messages.NOT_FOUND);

  // ★ Clean up: remove this label from all notes of the user
  await labelRepo.removeLabelFromAllNotes(labelId, userId);

  return label;
};

const addLabelToNote = async (labelId, noteId, userId) => {
  const note = await labelRepo.addLabelToNote(labelId, noteId, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const removeLabelFromNote = async (labelId, noteId, userId) => {
  const note = await labelRepo.removeLabelFromNote(labelId, noteId, userId);
  if (!note) throw new ApiError(404, messages.NOT_FOUND);
  return note;
};

const getNotesByLabel = async (labelId, userId) => {
  const label = await labelRepo.findByIdAndUser(labelId, userId);
  if (!label) throw new ApiError(404, messages.NOT_FOUND);
  return labelRepo.getNotesByLabel(labelId, userId);
};

module.exports = {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
  addLabelToNote,
  removeLabelFromNote,
  getNotesByLabel
};
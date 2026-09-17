const labelRepo = require('../repositories/label.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const { getCache, setCache, deleteCache } = require('../utils/cache');

const clearLabelsCache = async (userId) => {
  await deleteCache(`labels:${userId}`);
};

const createLabel = async (userId, name) => {
  try {
    const label = await labelRepo.create({ userId, name });
    await clearLabelsCache(userId);
    return label;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'Label with this name already exists');
    }
    throw err;
  }
};

const getLabels = async (userId) => {
  const cacheKey = `labels:${userId}`;


  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }


  const labels = await labelRepo.findByUser(userId);

 
  await setCache(cacheKey, labels);

  return labels;
};

const updateLabel = async (labelId, userId, name) => {
  const label = await labelRepo.updateById(labelId, userId, { name });
  if (!label) throw new ApiError(404, messages.NOT_FOUND);

  await clearLabelsCache(userId); 
  return label;
};

const deleteLabel = async (labelId, userId) => {
  const label = await labelRepo.deleteById(labelId, userId);
  if (!label) throw new ApiError(404, messages.NOT_FOUND);

  await labelRepo.removeLabelFromAllNotes(labelId, userId);

  await clearLabelsCache(userId); 
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
const labelService = require('../services/label.service');

const create = async (req, res, next) => {
  try {
    const label = await labelService.createLabel(req.user.id, req.body.name);
    res.status(201).json({
      success: true,
      message: 'Label created successfully',
      data: label,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const labels = await labelService.getLabels(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Labels fetched',
      data: labels,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const label = await labelService.updateLabel(req.params.labelId, req.user.id, req.body.name);
    res.status(200).json({
      success: true,
      message: 'Label updated successfully',
      data: label,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await labelService.deleteLabel(req.params.labelId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Label deleted successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const addToNote = async (req, res, next) => {
  try {
    const note = await labelService.addLabelToNote(
      req.params.labelId,
      req.params.noteId,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Label added to note',
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const removeFromNote = async (req, res, next) => {
  try {
    const note = await labelService.removeLabelFromNote(
      req.params.labelId,
      req.params.noteId,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Label removed from note',
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await labelService.getNotesByLabel(req.params.labelId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Notes by label fetched',
      data: notes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, update, remove, addToNote, removeFromNote, getNotes };
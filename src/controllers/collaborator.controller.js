const collaboratorService = require('../services/collaborator.service');

const add = async (req, res, next) => {
  try {
    const collaborator = await collaboratorService.addCollaborator(
      req.body.noteId,
      req.body.email,
      req.user.id
    );
    res.status(201).json({
      success: true,
      message: 'Collaborator added successfully',
      data: collaborator,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getByNote = async (req, res, next) => {
  try {
    // ★ Now passes userId for authorization
    const collaborators = await collaboratorService.getCollaborators(
      req.params.noteId,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Collaborators fetched',
      data: collaborators,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await collaboratorService.removeCollaborator(
      req.params.collaboratorId,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const removeByEmail = async (req, res, next) => {
  try {
    await collaboratorService.removeCollaboratorByEmail(
      req.params.noteId,
      req.params.email,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully',
      data: null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const getSharedNotes = async (req, res, next) => {
  try {
    const notes = await collaboratorService.getSharedNotes(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Shared notes fetched',
      data: notes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  add,
  getByNote,
  remove,
  removeByEmail,
  getSharedNotes
};
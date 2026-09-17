const collaboratorRepo = require('../repositories/collaborator.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const addCollaborator = async (noteId, email, addedBy) => {
  try {
    const collaborator = await collaboratorRepo.add(noteId, email, addedBy);

    if (!collaborator) {
      throw new ApiError(404, 'Note not found or user with this email does not exist');
    }

    return collaborator;
  } catch (err) {
    // ★ Handle duplicate collaborator
    if (err.code === 11000) {
      throw new ApiError(409, 'This user is already a collaborator on this note');
    }
    throw err;
  }
};

const getCollaborators = async (noteId, userId) => {
  // ★ Only owner or existing collaborator can see the list
  const isOwner = await collaboratorRepo.isNoteOwner(noteId, userId);
  const isCollaborator = await collaboratorRepo.isCollaborator(noteId, userId);

  if (!isOwner && !isCollaborator) {
    throw new ApiError(403, 'You do not have permission to view collaborators of this note');
  }

  return collaboratorRepo.findByNote(noteId);
};

const removeCollaborator = async (collaboratorId, userId) => {
  const collab = await collaboratorRepo.findById(collaboratorId);
  if (!collab) throw new ApiError(404, messages.NOT_FOUND);

  // Only note owner can remove
  if (collab.addedBy.toString() !== userId) {
    throw new ApiError(403, 'Only the note owner can remove collaborators');
  }

  return collaboratorRepo.removeById(collaboratorId);
};

const removeCollaboratorByEmail = async (noteId, email, userId) => {
  // ★ FIXED: Check permission FIRST, then delete
  const collab = await collaboratorRepo.findByNoteAndEmail(noteId, email);

  if (!collab) throw new ApiError(404, messages.NOT_FOUND);

  if (collab.addedBy.toString() !== userId) {
    throw new ApiError(403, 'Only the note owner can remove collaborators');
  }

  return collaboratorRepo.removeById(collab._id);
};

const getSharedNotes = async (userId) => {
  const records = await collaboratorRepo.getSharedNotes(userId);
  return records.map((r) => r.noteId).filter(Boolean);
};

module.exports = {
  addCollaborator,
  getCollaborators,
  removeCollaborator,
  removeCollaboratorByEmail,
  getSharedNotes
};
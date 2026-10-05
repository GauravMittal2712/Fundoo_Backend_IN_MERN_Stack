const express = require('express');
const router = express.Router();
const collaboratorController = require('../controllers/collaborator.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { add } = require('../validations/collaborator.validation');

router.use(auth);

router.post('/', validate(add), collaboratorController.add);
router.get('/shared-notes', collaboratorController.getSharedNotes);
router.get('/:noteId', collaboratorController.getByNote);
router.delete('/:collaboratorId', collaboratorController.remove);
router.delete('/:noteId/:email', collaboratorController.removeByEmail);

module.exports = router;
const express = require('express');
const router = express.Router();
const labelController = require('../controllers/label.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { create, update } = require('../validations/label.validation');

router.use(auth);

router.post('/', validate(create), labelController.create);
router.get('/', labelController.getAll);
router.put('/:labelId', validate(update), labelController.update);
router.delete('/:labelId', labelController.remove);
router.post('/:labelId/notes/:noteId', labelController.addToNote);
router.delete('/:labelId/notes/:noteId', labelController.removeFromNote);
router.get('/:labelId/notes', labelController.getNotes);

module.exports = router;
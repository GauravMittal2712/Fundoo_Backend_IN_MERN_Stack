const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { create, update } = require('../validations/note.validation');

router.use(auth);

router.post('/', validate(create), noteController.create);
router.get('/', noteController.getAll);
router.get('/search', noteController.search);
router.get('/:id', noteController.getOne);
router.put('/:id', validate(update), noteController.update);
router.delete('/:id', noteController.remove);
router.patch('/:id/archive', noteController.archive);
router.patch('/:id/trash', noteController.trash);
router.patch('/:id/restore', noteController.restore);

module.exports = router;
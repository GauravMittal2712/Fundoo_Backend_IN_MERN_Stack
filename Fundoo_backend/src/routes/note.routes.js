const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { create, update, setReminder } = require('../validations/note.validation');

router.use(auth);

router.post('/', validate(create), noteController.create);
router.get('/', noteController.getAll);
router.get('/search', noteController.search);
router.get('/reminders', noteController.getNotesWithReminders); // ★ NEW

router.get('/:id', noteController.getOne);
router.put('/:id', validate(update), noteController.update);
router.delete('/:id', noteController.remove);

router.patch('/:id/archive', noteController.archive);
router.patch('/:id/trash', noteController.trash);
router.patch('/:id/restore', noteController.restore);

// ★ NEW Reminder routes
router.post('/:noteId/reminder', validate(setReminder), noteController.setReminder);
router.get('/:noteId/reminder', noteController.getReminder);
router.delete('/:noteId/reminder', noteController.removeReminder);

module.exports = router;
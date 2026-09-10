const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { update } = require('../validations/profile.validation');

router.use(auth);

router.get('/', profileController.get);
router.put('/', validate(update), profileController.update);

module.exports = router;
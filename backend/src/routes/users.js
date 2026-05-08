const express = require('express');
const router = express.Router();
const { create, getAll, getMe, getById, update, updatePassword, remove } = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getAll);
router.post('/', authenticate, authorize('admin'), create);
router.get('/me', authenticate, getMe);
router.get('/:id', authenticate, authorize('admin'), getById);
router.put('/:id', authenticate, authorize('admin'), update);
router.put('/:id/password', authenticate, authorize('admin'), updatePassword);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;

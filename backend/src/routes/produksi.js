const express = require('express');
const router = express.Router();
const { getAll, getMetrics, getById, create, update, remove, advanceStatus, getRequirements, execute } = require('../controllers/produksiController');
const { authenticate } = require('../middleware/auth');

router.get('/',              getAll);
router.get('/metrics',       getMetrics);
router.get('/requirements',  authenticate, getRequirements);
router.post('/execute',      authenticate, execute);
router.get('/:id',           getById);
router.post('/',             authenticate, create);
router.post('/:id/advance',  authenticate, advanceStatus);
router.put('/:id',           authenticate, update);
router.delete('/:id',        authenticate, remove);

module.exports = router;


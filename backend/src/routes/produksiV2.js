const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createResepBaru, getRequirementsV2, executeBatchV2, getAllJamuV2, getResepDetail, updateResep, deleteResep } = require('../controllers/produksiV2Controller');

// Admin CRUD resep (raw SQL, no Rempah model)
router.get('/jamu', getAllJamuV2);
router.get('/jamu/:id', getResepDetail);
router.post('/resep', authenticate, createResepBaru);
router.put('/resep/:id', authenticate, updateResep);
router.delete('/resep/:id', authenticate, deleteResep);

// Staff production
router.get('/requirements', authenticate, getRequirementsV2);
router.post('/execute', authenticate, executeBatchV2);

module.exports = router;

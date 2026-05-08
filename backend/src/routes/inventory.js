const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  getInventoryByStatus,
  getLowStockItems,
  adjustStock,
  restock,
  getInventorySummary,
  getInventoryAnalytics,
  bulkAdjustStock,
} = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');

// Public endpoints (read-only)
router.get('/', getAllInventory);                              // List semua inventory dengan status
router.get('/summary', getInventorySummary);                   // Ringkasan inventory
router.get('/analytics', getInventoryAnalytics);               // Analytics lengkap
router.get('/low-stock', getLowStockItems);                    // Item stok rendah
router.get('/status/:status', getInventoryByStatus);           // Filter by status
router.get('/:id', getInventoryById);                          // Detail inventory

// Protected endpoints (write operations)
router.post('/adjust', authenticate, adjustStock);             // Adjust stok
router.post('/restock', authenticate, restock);                // Restock ke target level
router.post('/bulk-adjust', authenticate, bulkAdjustStock);    // Bulk adjust

module.exports = router;

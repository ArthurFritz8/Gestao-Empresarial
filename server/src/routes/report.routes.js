const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getStockReport,
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, getSalesReport);
router.get('/stock', protect, getStockReport);

module.exports = router;
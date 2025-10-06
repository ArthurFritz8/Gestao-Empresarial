const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} = require('../controllers/sale.controller');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.route('/:id')
  .get(protect, getSale)
  .put(protect, updateSale)
  .delete(protect, deleteSale);

module.exports = router;
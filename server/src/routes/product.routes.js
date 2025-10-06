const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductStats,
  getVehicleCompatibility
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth');

// Proteger todas as rotas
router.use(protect);

// Rotas para estatísticas e compatibilidade
router.get('/stats', getProductStats);
router.get('/vehicle-compatibility', getVehicleCompatibility);

// Rotas CRUD básicas
router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
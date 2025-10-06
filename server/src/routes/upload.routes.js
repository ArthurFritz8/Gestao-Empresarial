const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');

// Rota para upload de imagens (protegida por autenticação)
router.post('/', protect, uploadImage);

module.exports = router;
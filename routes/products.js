const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Tüm ürünleri listele
router.get('/', productController.index);

// Ürün detay sayfası
router.get('/:id', productController.show);

// Kategori sayfası
router.get('/category/:category', productController.category);

module.exports = router; 
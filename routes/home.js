const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Ana sayfa
router.get('/', homeController.index);

// Arama sayfası
router.get('/search', homeController.search);

module.exports = router; 
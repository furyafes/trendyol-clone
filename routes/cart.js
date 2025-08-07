const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Sepet sayfası
router.get('/', async (req, res) => {
  const cart = req.session.cart || [];
  
  if (cart.length === 0) {
    return res.render('cart', {
      title: 'Sepetim',
      cart: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    });
  }

  let subtotal = 0;
  let discount = 0;
  let shipping = 29.99;
  
  // Sepet verilerini hazırla
  const cartItems = await Promise.all(cart.map(async (item) => {
    const product = await Product.getProductById(item.id);
    if (product) {
      const itemTotal = product.price * item.quantity;
      const itemOriginalTotal = product.originalPrice ? product.originalPrice * item.quantity : itemTotal;
      const itemDiscount = itemOriginalTotal - itemTotal;
      
      subtotal += itemTotal;
      discount += itemDiscount;
      
      return {
        product: product,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: itemTotal
      };
    }
    return null;
  }));
  
  const validCartItems = cartItems.filter(item => item !== null);
  
  // Kargo ücreti hesapla
  if (subtotal >= 150) {
    shipping = 0;
  }
  
  const total = subtotal + shipping;

  res.render('cart', {
    title: 'Sepetim',
    cart: validCartItems,
    subtotal,
    discount,
    shipping,
    total
  });
});

// Sepete ürün ekle
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Ürün ID gereklidir.' });
    }

    const product = await Product.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    // Sepeti başlat
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Ürün zaten sepette var mı kontrol et
    const existingItemIndex = req.session.cart.findIndex(item => 
      item.id === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingItemIndex > -1) {
      // Miktarı güncelle
      req.session.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Yeni ürün ekle
      req.session.cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: parseInt(quantity),
        size: size || (product.sizes && product.sizes[0]),
        color: color || (product.colors && product.colors[0])
      });
    }

    res.json({ 
      success: true, 
      message: 'Ürün sepete eklendi.',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Sepete ürün ekleme hatası:', error);
    res.status(500).json({ error: 'Ürün sepete eklenirken bir hata oluştu.' });
  }
});

// Sepetten ürün çıkar
router.post('/remove', (req, res) => {
  try {
    const { productId, size, color } = req.body;
    
    if (!req.session.cart) {
      return res.status(400).json({ error: 'Sepet boş.' });
    }

    const itemIndex = req.session.cart.findIndex(item => 
      item.id === productId && 
      item.size === size && 
      item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Ürün sepette bulunamadı.' });
    }

    req.session.cart.splice(itemIndex, 1);

    res.json({ 
      success: true, 
      message: 'Ürün sepetten çıkarıldı.',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Sepetten ürün çıkarma hatası:', error);
    res.status(500).json({ error: 'Ürün sepetten çıkarılırken bir hata oluştu.' });
  }
});

// Sepet miktarını güncelle
router.post('/update', (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    
    if (!req.session.cart) {
      return res.status(400).json({ error: 'Sepet boş.' });
    }

    const itemIndex = req.session.cart.findIndex(item => 
      item.id === productId && 
      item.size === size && 
      item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Ürün sepette bulunamadı.' });
    }

    if (quantity <= 0) {
      req.session.cart.splice(itemIndex, 1);
    } else {
      req.session.cart[itemIndex].quantity = parseInt(quantity);
    }

    res.json({ 
      success: true, 
      message: 'Sepet güncellendi.',
      cartCount: req.session.cart.length
    });
  } catch (error) {
    console.error('Sepet güncelleme hatası:', error);
    res.status(500).json({ error: 'Sepet güncellenirken bir hata oluştu.' });
  }
});

// Sepeti temizle
router.post('/clear', (req, res) => {
  try {
    req.session.cart = [];
    res.json({ 
      success: true, 
      message: 'Sepet temizlendi.',
      cartCount: 0
    });
  } catch (error) {
    console.error('Sepet temizleme hatası:', error);
    res.status(500).json({ error: 'Sepet temizlenirken bir hata oluştu.' });
  }
});

module.exports = router; 
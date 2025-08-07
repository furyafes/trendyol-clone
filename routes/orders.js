const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Middleware - kullanıcı girişi kontrolü
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// Sipariş detay sayfası
router.get('/:orderNumber', requireAuth, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    // Siparişi bul
    const order = await Order.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).render('404', { 
        title: 'Sipariş Bulunamadı',
        message: 'Aradığınız sipariş bulunamadı.'
      });
    }
    
    // Siparişin kullanıcıya ait olduğunu kontrol et
    if (order.userId._id.toString() !== req.session.user.id) {
      return res.status(403).render('error', { 
        title: 'Erişim Reddedildi',
        error: { message: 'Bu siparişe erişim yetkiniz yok.' }
      });
    }
    
    res.render('order-detail', {
      title: `Sipariş #${orderNumber}`,
      order: order,
      user: req.session.user
    });
  } catch (error) {
    console.error('Sipariş detay hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Sipariş detayları yüklenirken bir hata oluştu.' }
    });
  }
});

// Sipariş durumu güncelleme (AJAX)
router.post('/:orderNumber/status', requireAuth, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;
    
    const order = await Order.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }
    
    // Siparişin kullanıcıya ait olduğunu kontrol et
    if (order.userId._id.toString() !== req.session.user.id) {
      return res.status(403).json({ error: 'Bu siparişe erişim yetkiniz yok.' });
    }
    
    // Durumu güncelle
    const updatedOrder = await Order.updateOrderStatus(order._id, status);
    
    res.json({ 
      success: true, 
      message: 'Sipariş durumu güncellendi.',
      status: status
    });
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json({ error: 'Sipariş durumu güncellenirken bir hata oluştu.' });
  }
});

// Sipariş iptal etme
router.post('/:orderNumber/cancel', requireAuth, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;
    
    const order = await Order.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı.' });
    }
    
    // Siparişin kullanıcıya ait olduğunu kontrol et
    if (order.userId._id.toString() !== req.session.user.id) {
      return res.status(403).json({ error: 'Bu siparişe erişim yetkiniz yok.' });
    }
    
    // Sadece belirli durumlardaki siparişler iptal edilebilir
    const allowedStatuses = ['pending', 'processing'];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ error: 'Bu sipariş iptal edilemez.' });
    }
    
    // Siparişi iptal et
    await Order.updateOrderStatus(order._id, 'cancelled', { cancellationReason: reason });
    
    res.json({ 
      success: true, 
      message: 'Sipariş başarıyla iptal edildi.'
    });
  } catch (error) {
    console.error('Sipariş iptal hatası:', error);
    res.status(500).json({ error: 'Sipariş iptal edilirken bir hata oluştu.' });
  }
});

module.exports = router; 
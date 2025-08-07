const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Admin middleware - sadece admin kullanıcılar erişebilir
const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  
  if (!req.session.user.isAdmin) {
    return res.status(403).render('error', {
      title: 'Erişim Reddedildi',
      error: { message: 'Bu sayfaya erişim yetkiniz yok.' }
    });
  }
  
  next();
};

// Admin Dashboard
router.get('/', requireAdmin, async (req, res) => {
  try {
    // İstatistikleri getir
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Son siparişler
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Toplam gelir
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const averageOrderValue = revenueStats[0]?.averageOrderValue || 0;
    
    // Durum bazında sipariş sayıları
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.session.user,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        averageOrderValue
      },
      recentOrders,
      orderStatusStats
    });
  } catch (error) {
    console.error('Admin dashboard hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Dashboard yüklenirken bir hata oluştu.' }
    });
  }
});

// Kullanıcı Yönetimi
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.render('admin/users', {
      title: 'Kullanıcı Yönetimi',
      user: req.session.user,
      users
    });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Kullanıcı listesi yüklenirken bir hata oluştu.' }
    });
  }
});

// Kullanıcı detayı
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) {
      return res.status(404).render('404', {
        title: 'Kullanıcı Bulunamadı',
        message: 'Aradığınız kullanıcı bulunamadı.'
      });
    }
    
    // Kullanıcının siparişlerini getir
    const userOrders = await Order.getOrdersByUserId(req.params.id);
    
    res.render('admin/user-detail', {
      title: `Kullanıcı: ${user.firstName} ${user.lastName}`,
      user: req.session.user,
      targetUser: user,
      orders: userOrders
    });
  } catch (error) {
    console.error('Kullanıcı detay hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Kullanıcı detayı yüklenirken bir hata oluştu.' }
    });
  }
});

// Kullanıcı sil
router.post('/users/:id/delete', requireAdmin, async (req, res) => {
  try {
    await User.deleteUser(req.params.id);
    res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı silinirken bir hata oluştu.' });
  }
});

// Ürün Yönetimi
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.render('admin/products', {
      title: 'Ürün Yönetimi',
      user: req.session.user,
      products
    });
  } catch (error) {
    console.error('Ürün listesi hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Ürün listesi yüklenirken bir hata oluştu.' }
    });
  }
});

// Ürün ekleme sayfası
router.get('/products/add', requireAdmin, (req, res) => {
  res.render('admin/product-form', {
    title: 'Yeni Ürün Ekle',
    user: req.session.user,
    product: null
  });
});

// Ürün düzenleme sayfası
router.get('/products/:id/edit', requireAdmin, async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) {
      return res.status(404).render('404', {
        title: 'Ürün Bulunamadı',
        message: 'Aradığınız ürün bulunamadı.'
      });
    }
    
    res.render('admin/product-form', {
      title: 'Ürün Düzenle',
      user: req.session.user,
      product
    });
  } catch (error) {
    console.error('Ürün düzenleme hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Ürün düzenleme sayfası yüklenirken bir hata oluştu.' }
    });
  }
});

// Ürün kaydet (ekle/güncelle)
router.post('/products/save', requireAdmin, async (req, res) => {
  try {
    const {
      name, brand, category, description, price, originalPrice,
      discount, images, sizes, colors, rating, reviewCount,
      stockQuantity, inStock, isFeatured
    } = req.body;
    
    const productData = {
      name,
      brand,
      category,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      discount: discount ? parseFloat(discount) : 0,
      images: images.split(',').map(img => img.trim()),
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : [],
      colors: colors ? colors.split(',').map(color => color.trim()) : [],
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
      inStock: inStock === 'true',
      isFeatured: isFeatured === 'true'
    };
    
    if (req.body.id) {
      // Güncelle
      await Product.updateProduct(req.body.id, productData);
      res.json({ success: true, message: 'Ürün başarıyla güncellendi.' });
    } else {
      // Yeni ürün ekle
      await Product.createProduct(productData);
      res.json({ success: true, message: 'Ürün başarıyla eklendi.' });
    }
  } catch (error) {
    console.error('Ürün kaydetme hatası:', error);
    res.status(500).json({ error: 'Ürün kaydedilirken bir hata oluştu.' });
  }
});

// Ürün sil
router.post('/products/:id/delete', requireAdmin, async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({ error: 'Ürün silinirken bir hata oluştu.' });
  }
});

// Sipariş Yönetimi
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.render('admin/orders', {
      title: 'Sipariş Yönetimi',
      user: req.session.user,
      orders
    });
  } catch (error) {
    console.error('Sipariş listesi hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Sipariş listesi yüklenirken bir hata oluştu.' }
    });
  }
});

// Sipariş detayı
router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).render('404', {
        title: 'Sipariş Bulunamadı',
        message: 'Aradığınız sipariş bulunamadı.'
      });
    }
    
    res.render('admin/order-detail', {
      title: `Sipariş #${order.orderNumber}`,
      user: req.session.user,
      order
    });
  } catch (error) {
    console.error('Sipariş detay hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'Sipariş detayı yüklenirken bir hata oluştu.' }
    });
  }
});

// Sipariş durumu güncelle
router.post('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await Order.updateOrderStatus(req.params.id, status);
    res.json({ success: true, message: 'Sipariş durumu güncellendi.' });
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json({ error: 'Sipariş durumu güncellenirken bir hata oluştu.' });
  }
});

// İstatistikler
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Genel istatistikler
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Gelir istatistikleri
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    // Durum bazında sipariş istatistikleri
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Aylık gelir istatistikleri (son 6 ay)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.render('admin/stats', {
      title: 'İstatistikler',
      user: req.session.user,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        averageOrderValue: revenueStats[0]?.averageOrderValue || 0
      },
      orderStatusStats,
      monthlyRevenue
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).render('error', {
      title: 'Hata',
      error: { message: 'İstatistikler yüklenirken bir hata oluştu.' }
    });
  }
});

module.exports = router; 
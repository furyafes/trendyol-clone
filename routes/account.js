const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware - kullanıcı girişi kontrolü
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Hesap sayfası
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.getUserById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }

    res.render('account/index', {
      title: 'Hesabım',
      user
    });
  } catch (error) {
    console.error('Hesap sayfası hatası:', error);
    res.redirect('/auth/login');
  }
});

// Profil düzenleme sayfası
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.getUserById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }

    res.render('account/profile', {
      title: 'Profil Düzenle',
      user
    });
  } catch (error) {
    console.error('Profil sayfası hatası:', error);
    res.redirect('/auth/login');
  }
});

// Profil güncelleme
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    if (!firstName || !lastName) {
      return res.render('account/profile', {
        title: 'Profil Düzenle',
        user: User.getUserById(req.session.user.id),
        error: 'Ad ve soyad gereklidir.'
      });
    }

    const updatedUser = await User.updateUser(req.session.user.id, {
      firstName,
      lastName,
      phone
    });

    if (!updatedUser) {
      return res.render('account/profile', {
        title: 'Profil Düzenle',
        user: await User.getUserById(req.session.user.id),
        error: 'Profil güncellenirken bir hata oluştu.'
      });
    }

    // Session'ı güncelle
    req.session.user = {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName
    };

    res.render('account/profile', {
      title: 'Profil Düzenle',
      user: updatedUser,
      success: 'Profil başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('Profil güncellenirken hata:', error);
    res.render('account/profile', {
      title: 'Profil Düzenle',
      user: User.getUserById(req.session.user.id),
      error: 'Profil güncellenirken bir hata oluştu.'
    });
  }
});

// Şifre değiştirme sayfası
router.get('/change-password', requireAuth, (req, res) => {
  res.render('account/change-password', {
    title: 'Şifre Değiştir'
  });
});

// Şifre değiştirme işlemi
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('account/change-password', {
        title: 'Şifre Değiştir',
        error: 'Tüm alanlar gereklidir.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render('account/change-password', {
        title: 'Şifre Değiştir',
        error: 'Yeni şifreler eşleşmiyor.'
      });
    }

    if (newPassword.length < 6) {
      return res.render('account/change-password', {
        title: 'Şifre Değiştir',
        error: 'Yeni şifre en az 6 karakter olmalıdır.'
      });
    }

    const user = await User.getUserById(req.session.user.id);
    
    // Mevcut şifreyi kontrol et
    const isValidCurrentPassword = await user.comparePassword(currentPassword);
    if (!isValidCurrentPassword) {
      return res.render('account/change-password', {
        title: 'Şifre Değiştir',
        error: 'Mevcut şifre yanlış.'
      });
    }

    // Şifreyi güncelle
    await User.updateUser(req.session.user.id, {
      password: newPassword
    });

    res.render('account/change-password', {
      title: 'Şifre Değiştir',
      success: 'Şifre başarıyla değiştirildi.'
    });
  } catch (error) {
    console.error('Şifre değiştirilirken hata:', error);
    res.render('account/change-password', {
      title: 'Şifre Değiştir',
      error: 'Şifre değiştirilirken bir hata oluştu.'
    });
  }
});
  }
});

// Siparişler sayfası
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    // Kullanıcının siparişlerini getir
    const orders = await Order.getOrdersByUserId(req.session.user.id);
    
    // Demo siparişleri oluştur (eğer hiç sipariş yoksa)
    if (orders.length === 0) {
      await Order.createDemoOrders(req.session.user.id);
      const updatedOrders = await Order.getOrdersByUserId(req.session.user.id);
      return res.render('account/orders', {
        title: 'Siparişlerim',
        user: req.session.user,
        orders: updatedOrders
      });
    }

    res.render('account/orders', {
      title: 'Siparişlerim',
      user: req.session.user,
      orders: orders
    });
  } catch (error) {
    console.error('Siparişler sayfası hatası:', error);
    res.render('account/orders', {
      title: 'Siparişlerim',
      user: req.session.user,
      orders: []
    });
  }
});

// Adresler sayfası
router.get('/addresses', requireAuth, async (req, res) => {
  try {
    const user = await User.getUserById(req.session.user.id);
    
    res.render('account/addresses', {
      title: 'Adreslerim',
      user
    });
  } catch (error) {
    console.error('Adresler sayfası hatası:', error);
    res.redirect('/auth/login');
  }
});

module.exports = router; 
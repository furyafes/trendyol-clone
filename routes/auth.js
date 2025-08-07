const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Giriş sayfası
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/account');
  }
  res.render('auth/login', { title: 'Giriş Yap' });
});

// Giriş işlemi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasyon
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Giriş Yap',
        error: 'E-posta ve şifre gereklidir.'
      });
    }

    // Kullanıcıyı bul
    const user = await User.getUserByEmail(email);
    
    if (!user) {
      return res.render('auth/login', {
        title: 'Giriş Yap',
        error: 'Geçersiz e-posta veya şifre.'
      });
    }
    
    // Şifreyi doğrula
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.render('auth/login', {
        title: 'Giriş Yap',
        error: 'Geçersiz e-posta veya şifre.'
      });
    }
    
    // Session'a kullanıcı bilgilerini kaydet
    req.session.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin || false
    };
    
    const redirectUrl = req.query.redirect || '/account';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.render('auth/login', {
      title: 'Giriş Yap',
      error: 'Giriş yapılırken bir hata oluştu.'
    });
  }
});

// Kayıt sayfası
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/account');
  }
  res.render('auth/register', { title: 'Kayıt Ol' });
});

// Kayıt işlemi
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Validasyon
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.render('auth/register', {
        title: 'Kayıt Ol',
        error: 'Tüm alanlar gereklidir.'
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'Kayıt Ol',
        error: 'Şifreler eşleşmiyor.'
      });
    }

    if (password.length < 6) {
      return res.render('auth/register', {
        title: 'Kayıt Ol',
        error: 'Şifre en az 6 karakter olmalıdır.'
      });
    }

    // Email kullanılabilir mi kontrol et
    const isEmailAvailable = await User.isEmailAvailable(email);
    if (!isEmailAvailable) {
      return res.render('auth/register', {
        title: 'Kayıt Ol',
        error: 'Bu e-posta adresi zaten kullanılıyor.'
      });
    }

    // Yeni kullanıcı oluştur
    const newUser = await User.createUser({
      firstName,
      lastName,
      email,
      password
    });

    // Session'a kullanıcı bilgilerini kaydet
    req.session.user = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    };

    res.redirect('/account');
  } catch (error) {
    console.error('Kayıt olurken hata:', error);
    res.render('auth/register', {
      title: 'Kayıt Ol',
      error: 'Kayıt olurken bir hata oluştu.'
    });
  }
});

// Çıkış işlemi
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Çıkış yapılırken hata:', err);
    }
    res.redirect('/');
  });
});

module.exports = router; 
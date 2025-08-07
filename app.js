const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');

// Route'ları import et
const homeRoutes = require('./routes/home');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const accountRoutes = require('./routes/account');
const checkoutRoutes = require('./routes/checkout');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine ayarları
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware'ler
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session ayarları
app.use(session({
  secret: 'trendyol-clone-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 saat
}));

// Global middleware - kullanıcı bilgilerini template'lere aktar
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cart = req.session.cart || [];
  next();
});

// Route'ları tanımla
app.use('/', homeRoutes);
app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/account', accountRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/orders', ordersRoutes);
app.use('/admin', adminRoutes);

// 404 sayfası
app.use((req, res) => {
  res.status(404).render('404', { title: 'Sayfa Bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Hata',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// MongoDB bağlantısı ve sunucuyu başlat
const startServer = async () => {
  try {
    // MongoDB'ye bağlan
    await connectDB();
    
    // Demo verileri oluştur
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    
    await User.createDemoUsers();
    await Product.createDemoProducts();
    
    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Trendyol Clone uygulaması http://localhost:${PORT} adresinde çalışıyor`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken hata:', error);
    process.exit(1);
  }
};

startServer(); 
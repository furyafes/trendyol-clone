const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// Checkout sayfası
router.get('/', (req, res) => {
  // Kullanıcı giriş yapmış mı kontrol et
  if (!req.session.user) {
    return res.redirect('/auth/login?redirect=checkout');
  }

  const cart = req.session.cart || [];
  
  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  let subtotal = 0;
  let discount = 0;
  let shipping = 29.99;
  
  // Sepet verilerini hazırla
  const cartItems = cart.map(item => {
    const product = Product.getProductById(item.id);
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
  }).filter(item => item !== null);
  
  // Kargo ücreti hesapla
  if (subtotal >= 150) {
    shipping = 0;
  }
  
  const total = subtotal + shipping;

  res.render('checkout', {
    title: 'Ödeme',
    cart: cartItems,
    subtotal,
    discount,
    shipping,
    total,
    user: req.session.user
  });
});

// Sipariş oluşturma
router.post('/place-order', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });
  }

  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.status(400).json({ error: 'Sepetiniz boş.' });
  }

  const {
    firstName, lastName, email, phone,
    address, district, city, postalCode,
    paymentMethod, cardNumber, cardName, cardExpiry, cardCvv
  } = req.body;

  // Basit validasyon
  if (!firstName || !lastName || !email || !phone || !address || !district || !city || !postalCode) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }

  if (paymentMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
    return res.status(400).json({ error: 'Kart bilgilerini doldurun.' });
  }

  // Sepet verilerini hazırla
  let subtotal = 0;
  let discount = 0;
  let shipping = 29.99;
  
  const orderItems = cart.map(item => {
    const product = Product.getProductById(item.id);
    if (product) {
      const itemTotal = product.price * item.quantity;
      const itemOriginalTotal = product.originalPrice ? product.originalPrice * item.quantity : itemTotal;
      const itemDiscount = itemOriginalTotal - itemTotal;
      
      subtotal += itemTotal;
      discount += itemDiscount;

      return {
        productId: item.id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: itemTotal
      };
    }
    return null;
  }).filter(item => item !== null);

  if (subtotal >= 150) {
    shipping = 0;
  }

  const total = subtotal + shipping;

                // Sipariş numarası oluştur
              const orderNumber = Order.generateOrderNumber();

              // Sipariş objesi oluştur
              const orderData = {
                orderNumber: orderNumber,
                userId: req.session.user.id,
                items: orderItems,
                subtotal: subtotal,
                discount: discount,
                shipping: shipping,
                total: total,
                paymentMethod: paymentMethod,
                shippingAddress: {
                  firstName,
                  lastName,
                  email,
                  phone,
                  address,
                  district,
                  city,
                  postalCode
                },
                status: 'pending'
              };

              // Veritabanına siparişi kaydet
              Order.createOrder(orderData);

              // Sepeti temizle
              req.session.cart = [];

  res.json({
    success: true,
    message: 'Siparişiniz başarıyla oluşturuldu!',
    orderNumber: orderNumber,
    redirectUrl: `/orders/${orderNumber}`
  });
});

// Siparişi tamamla
router.post('/place-order', (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    address, 
    city, 
    district, 
    postalCode,
    paymentMethod,
    cardNumber,
    cardName,
    cardExpiry,
    cardCvv
  } = req.body;

  // Validasyon
  if (!firstName || !lastName || !email || !phone || !address || !city || !district || !postalCode) {
    return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ error: 'Lütfen ödeme yöntemi seçin.' });
  }

  if (paymentMethod === 'card') {
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      return res.status(400).json({ error: 'Lütfen kart bilgilerini eksiksiz doldurun.' });
    }
  }

  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.status(400).json({ error: 'Sepetiniz boş.' });
  }

  // Sipariş numarası oluştur
  const orderNumber = 'ORD-' + Date.now();
  
  // Sipariş verilerini hazırla
  let subtotal = 0;
  const orderItems = cart.map(item => {
    const product = Product.getProductById(item.id);
    if (product) {
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: itemTotal
      };
    }
    return null;
  }).filter(item => item !== null);

  const shipping = subtotal >= 150 ? 0 : 29.99;
  const total = subtotal + shipping;

  // Sipariş objesi
  const order = {
    orderNumber,
    userId: req.session.user.id,
    items: orderItems,
    subtotal,
    shipping,
    total,
    shippingAddress: {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      district,
      postalCode
    },
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Session'a siparişi kaydet (gerçek uygulamada veritabanına kaydedilir)
  if (!req.session.orders) {
    req.session.orders = [];
  }
  req.session.orders.push(order);

  // Sepeti temizle
  req.session.cart = [];

  res.json({ 
    success: true, 
    message: 'Siparişiniz başarıyla oluşturuldu!',
    orderNumber: orderNumber
  });
});

module.exports = router; 
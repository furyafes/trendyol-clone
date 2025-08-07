const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  total: {
    type: Number,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    required: true
  },
  shippingAddress: shippingAddressSchema,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  cancellationReason: String,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Sipariş numarası oluştur
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
};

// Tüm siparişleri getir
orderSchema.statics.getAllOrders = async function() {
  return this.find()
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Kullanıcının siparişlerini getir
orderSchema.statics.getOrdersByUserId = async function(userId) {
  return this.find({ userId })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Sipariş numarası ile sipariş getir
orderSchema.statics.getOrderByNumber = async function(orderNumber) {
  return this.findOne({ orderNumber })
    .populate('userId', 'firstName lastName email');
};

// ID ile sipariş getir
orderSchema.statics.getOrderById = async function(id) {
  return this.findById(id)
    .populate('userId', 'firstName lastName email');
};

// Sipariş oluştur
orderSchema.statics.createOrder = async function(orderData) {
  const order = new this(orderData);
  return order.save();
};

// Sipariş güncelle
orderSchema.statics.updateOrder = async function(id, updateData) {
  updateData.updatedAt = Date.now();
  return this.findByIdAndUpdate(id, updateData, { new: true })
    .populate('userId', 'firstName lastName email');
};

// Sipariş durumu güncelle
orderSchema.statics.updateOrderStatus = async function(id, status, additionalData = {}) {
  const updateData = {
    status,
    updatedAt: Date.now(),
    ...additionalData
  };
  
  if (status === 'cancelled') {
    updateData.cancelledAt = Date.now();
  }
  
  return this.findByIdAndUpdate(id, updateData, { new: true })
    .populate('userId', 'firstName lastName email');
};

// Sipariş sil
orderSchema.statics.deleteOrder = async function(id) {
  return this.findByIdAndDelete(id);
};

// İstatistikler
orderSchema.statics.getOrderStats = async function(userId = null) {
  const matchStage = userId ? { userId } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
  
  return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

// Durum bazında istatistikler
orderSchema.statics.getStatusStats = async function(userId = null) {
  const matchStage = userId ? { userId } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Demo siparişleri oluştur
orderSchema.statics.createDemoOrders = async function(userId) {
  const demoOrders = [
    {
      orderNumber: '12345',
      userId: userId,
      status: 'delivered',
      total: 299.99,
      subtotal: 299.99,
      shipping: 0,
      discount: 0,
      paymentMethod: 'card',
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          productName: 'Nike Air Max 270',
          productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
          price: 299.99,
          quantity: 1,
          total: 299.99,
          size: '42',
          color: 'Siyah'
        }
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@trendyol.com',
        phone: '0555 123 45 67',
        address: 'Test Mahallesi, Test Sokak No:1',
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34700'
      },
      createdAt: new Date('2024-01-15T10:30:00.000Z')
    },
    {
      orderNumber: '12344',
      userId: userId,
      status: 'shipped',
      total: 159.99,
      subtotal: 159.99,
      shipping: 29.99,
      discount: 0,
      paymentMethod: 'card',
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          productName: 'Adidas Ultraboost 21',
          productImage: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500',
          price: 159.99,
          quantity: 1,
          total: 159.99,
          size: '41',
          color: 'Beyaz'
        }
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@trendyol.com',
        phone: '0555 123 45 67',
        address: 'Test Mahallesi, Test Sokak No:1',
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34700'
      },
      createdAt: new Date('2024-01-12T14:20:00.000Z')
    },
    {
      orderNumber: '12343',
      userId: userId,
      status: 'processing',
      total: 89.99,
      subtotal: 89.99,
      shipping: 29.99,
      discount: 0,
      paymentMethod: 'cash',
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          productName: 'Puma RS-X',
          productImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
          price: 89.99,
          quantity: 1,
          total: 89.99,
          size: '40',
          color: 'Gri'
        }
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@trendyol.com',
        phone: '0555 123 45 67',
        address: 'Test Mahallesi, Test Sokak No:1',
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34700'
      },
      createdAt: new Date('2024-01-10T09:15:00.000Z')
    }
  ];

  for (const orderData of demoOrders) {
    const existingOrder = await this.findOne({ orderNumber: orderData.orderNumber });
    if (!existingOrder) {
      await this.createOrder(orderData);
    }
  }
};

module.exports = mongoose.model('Order', orderSchema); 
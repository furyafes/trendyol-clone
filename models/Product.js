const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  images: [{
    type: String,
    required: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tüm ürünleri getir
productSchema.statics.getAllProducts = async function() {
  return this.find().sort({ createdAt: -1 });
};

// ID ile ürün getir
productSchema.statics.getProductById = async function(id) {
  return this.findById(id);
};

// Kategoriye göre ürünleri getir
productSchema.statics.getProductsByCategory = async function(category) {
  return this.find({ category: category }).sort({ createdAt: -1 });
};

// Markaya göre ürünleri getir
productSchema.statics.getProductsByBrand = async function(brand) {
  return this.find({ brand: brand }).sort({ createdAt: -1 });
};

// Öne çıkan ürünleri getir
productSchema.statics.getFeaturedProducts = async function(limit = 8) {
  return this.find({ isFeatured: true }).limit(limit).sort({ createdAt: -1 });
};

// İndirimli ürünleri getir
productSchema.statics.getDiscountedProducts = async function(limit = 8) {
  return this.find({ discount: { $gt: 0 } }).limit(limit).sort({ discount: -1 });
};

// Stokta olan ürünleri getir
productSchema.statics.getInStockProducts = async function() {
  return this.find({ inStock: true }).sort({ createdAt: -1 });
};

// Ürün ara
productSchema.statics.searchProducts = async function(query, options = {}) {
  const { category, brand, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  
  let searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  };

  if (category) searchQuery.category = category;
  if (brand) searchQuery.brand = brand;
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(searchQuery).sort(sortOptions);
};

// Ürün oluştur
productSchema.statics.createProduct = async function(productData) {
  const product = new this(productData);
  return product.save();
};

// Ürün güncelle
productSchema.statics.updateProduct = async function(id, updateData) {
  updateData.updatedAt = Date.now();
  return this.findByIdAndUpdate(id, updateData, { new: true });
};

// Ürün sil
productSchema.statics.deleteProduct = async function(id) {
  return this.findByIdAndDelete(id);
};

// Demo ürünleri oluştur
productSchema.statics.createDemoProducts = async function() {
  const demoProducts = [
    {
      name: 'Nike Air Max 270',
      brand: 'Nike',
      category: 'Spor Ayakkabı',
      description: 'Günlük kullanım için ideal, rahat ve şık spor ayakkabı.',
      price: 299.99,
      originalPrice: 399.99,
      discount: 25,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
      colors: ['Siyah', 'Beyaz', 'Gri', 'Mavi'],
      rating: 4.5,
      reviewCount: 128,
      inStock: true,
      stockQuantity: 50,
      isFeatured: true
    },
    {
      name: 'Adidas Ultraboost 21',
      brand: 'Adidas',
      category: 'Spor Ayakkabı',
      description: 'Koşu için özel olarak tasarlanmış, maksimum performans sağlayan ayakkabı.',
      price: 159.99,
      originalPrice: 199.99,
      discount: 20,
      images: [
        'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
      colors: ['Siyah', 'Beyaz', 'Kırmızı'],
      rating: 4.3,
      reviewCount: 89,
      inStock: true,
      stockQuantity: 35,
      isFeatured: true
    },
    {
      name: 'Puma RS-X',
      brand: 'Puma',
      category: 'Spor Ayakkabı',
      description: 'Retro tasarım ile modern konforu birleştiren şık spor ayakkabı.',
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
      colors: ['Beyaz', 'Gri', 'Mavi'],
      rating: 4.1,
      reviewCount: 67,
      inStock: true,
      stockQuantity: 25,
      isFeatured: false
    },
    {
      name: 'New Balance 574',
      brand: 'New Balance',
      category: 'Spor Ayakkabı',
      description: 'Klasik tasarım ve üstün kalite ile günlük kullanım için mükemmel.',
      price: 199.99,
      originalPrice: 249.99,
      discount: 20,
      images: [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
      colors: ['Gri', 'Mavi', 'Siyah'],
      rating: 4.4,
      reviewCount: 156,
      inStock: true,
      stockQuantity: 40,
      isFeatured: true
    },
    {
      name: 'Converse Chuck Taylor',
      brand: 'Converse',
      category: 'Spor Ayakkabı',
      description: 'Zamanın testinden geçmiş, her yaştan insanın tercih ettiği klasik ayakkabı.',
      price: 129.99,
      originalPrice: 159.99,
      discount: 19,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
      ],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
      colors: ['Beyaz', 'Siyah', 'Kırmızı', 'Mavi'],
      rating: 4.6,
      reviewCount: 234,
      inStock: true,
      stockQuantity: 60,
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy A54 5G',
      brand: 'Samsung',
      category: 'Telefon',
      description: '5G teknolojisi ile hızlı internet, güçlü kamera ve uzun pil ömrü.',
      price: 8999.99,
      originalPrice: 10999.99,
      discount: 18,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500'
      ],
      sizes: ['128GB', '256GB'],
      colors: ['Siyah', 'Beyaz', 'Mavi'],
      rating: 4.2,
      reviewCount: 89,
      inStock: true,
      stockQuantity: 30,
      isFeatured: true
    },
    {
      name: 'iPhone 14 Pro',
      brand: 'Apple',
      category: 'Telefon',
      description: 'Apple\'ın en gelişmiş kamera sistemi ve A16 Bionic çip ile.',
      price: 44999.99,
      originalPrice: 49999.99,
      discount: 10,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
      ],
      sizes: ['128GB', '256GB', '512GB'],
      colors: ['Altın', 'Gümüş', 'Uzay Grisi'],
      rating: 4.7,
      reviewCount: 156,
      inStock: true,
      stockQuantity: 20,
      isFeatured: true
    },
    {
      name: 'MacBook Air M2',
      brand: 'Apple',
      category: 'Bilgisayar',
      description: 'M2 çip ile güçlü performans, uzun pil ömrü ve ince tasarım.',
      price: 34999.99,
      originalPrice: 39999.99,
      discount: 13,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'
      ],
      sizes: ['256GB', '512GB', '1TB'],
      colors: ['Gümüş', 'Uzay Grisi', 'Altın'],
      rating: 4.8,
      reviewCount: 78,
      inStock: true,
      stockQuantity: 15,
      isFeatured: true
    }
  ];

  for (const productData of demoProducts) {
    const existingProduct = await this.findOne({ name: productData.name });
    if (!existingProduct) {
      await this.createProduct(productData);
    }
  }
};

module.exports = mongoose.model('Product', productSchema); 
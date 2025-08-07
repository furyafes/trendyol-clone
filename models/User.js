const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  isAdmin: {
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

// Şifre hash'leme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Tüm kullanıcıları getir
userSchema.statics.getAllUsers = async function() {
  return this.find().select('-password');
};

// ID ile kullanıcı getir
userSchema.statics.getUserById = async function(id) {
  return this.findById(id).select('-password');
};

// Email ile kullanıcı getir
userSchema.statics.getUserByEmail = async function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Kullanıcı oluştur
userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  return user.save();
};

// Kullanıcı güncelle
userSchema.statics.updateUser = async function(id, updateData) {
  updateData.updatedAt = Date.now();
  return this.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
};

// Kullanıcı sil
userSchema.statics.deleteUser = async function(id) {
  return this.findByIdAndDelete(id);
};

// Email kontrolü
userSchema.statics.isEmailAvailable = async function(email, excludeId = null) {
  const query = { email: email.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const user = await this.findOne(query);
  return !user;
};

// Demo kullanıcıları oluştur
userSchema.statics.createDemoUsers = async function() {
  const demoUsers = [
    {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@trendyol.com',
      password: '123456',
      phone: '0555 123 45 67',
      address: {
        street: 'Test Mahallesi, Test Sokak No:1',
        city: 'İstanbul',
        district: 'Kadıköy',
        postalCode: '34700'
      }
    },
    {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@trendyol.com',
      password: '123456',
      phone: '0555 987 65 43',
      address: {
        street: 'Demo Mahallesi, Demo Sokak No:2',
        city: 'Ankara',
        district: 'Çankaya',
        postalCode: '06690'
      }
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trendyol.com',
      password: 'admin123',
      phone: '0555 111 11 11',
      isAdmin: true,
      address: {
        street: 'Admin Mahallesi, Admin Sokak No:1',
        city: 'İstanbul',
        district: 'Beşiktaş',
        postalCode: '34353'
      }
    }
  ];

  for (const userData of demoUsers) {
    const existingUser = await this.getUserByEmail(userData.email);
    if (!existingUser) {
      await this.createUser(userData);
    }
  }
};

module.exports = mongoose.model('User', userSchema); 
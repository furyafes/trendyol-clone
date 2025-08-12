const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://yafesgorkem:GPdkcYK1GfIDHdNC@testpre.xz3dzno.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 
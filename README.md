# Trendyol Clone

Express.js ve JavaScript kullanılarak oluşturulmuş basit bir e-ticaret uygulaması.

## 🚀 Özellikler

- **Ana Sayfa**: Öne çıkan ürünler, indirimli ürünler, kategoriler ve markalar
- **Ürün Listesi**: Filtreleme, sıralama ve sayfalama
- **Ürün Detayı**: Ürün bilgileri, benzer ürünler
- **Sepet Yönetimi**: Ürün ekleme, çıkarma, miktar güncelleme
- **Kullanıcı Yönetimi**: Giriş, kayıt, profil düzenleme
- **Arama**: Ürün, kategori ve marka arama
- **Responsive Tasarım**: Mobil uyumlu arayüz

## 🛠️ Teknolojiler

- **Backend**: Express.js
- **View Engine**: EJS (Embedded JavaScript)
- **Database**: JSON dosyası (fake data)
- **CSS Framework**: Bootstrap 5
- **Icons**: Font Awesome
- **Authentication**: Session-based
- **Styling**: Custom CSS

## 📁 Proje Yapısı

```
trendyol-clone/
├── app.js                 # Ana uygulama dosyası
├── package.json           # Bağımlılıklar
├── data/                  # Veri dosyaları
│   ├── products.json      # Ürün verileri
│   └── users.json         # Kullanıcı verileri
├── models/                # Veri modelleri
│   ├── Product.js         # Ürün modeli
│   └── User.js            # Kullanıcı modeli
├── controllers/           # Controller'lar
│   ├── homeController.js  # Ana sayfa controller'ı
│   └── productController.js # Ürün controller'ı
├── routes/                # Route'lar
│   ├── home.js            # Ana sayfa route'ları
│   ├── products.js        # Ürün route'ları
│   ├── auth.js            # Kimlik doğrulama route'ları
│   ├── cart.js            # Sepet route'ları
│   └── account.js         # Hesap route'ları
├── views/                 # EJS template'leri
│   ├── layout.ejs         # Ana layout
│   ├── home.ejs           # Ana sayfa
│   ├── products.ejs       # Ürünler sayfası
│   └── ...                # Diğer template'ler
└── public/                # Statik dosyalar
    ├── css/
    │   └── style.css      # Ana CSS dosyası
    └── js/
        └── main.js        # Ana JavaScript dosyası
```

## 🚀 Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd trendyol-clone
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Uygulamayı başlatın**
   ```bash
   # Geliştirme modu
   npm run dev
   
   # Production modu
   npm start
   ```

4. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 👤 Demo Kullanıcılar

Uygulamayı test etmek için aşağıdaki demo kullanıcıları kullanabilirsiniz:

### Demo Kullanıcı 1
- **Email**: demo@trendyol.com
- **Şifre**: demo123

### Demo Kullanıcı 2
- **Email**: test@trendyol.com
- **Şifre**: test123

## 📱 Sayfalar

- **Ana Sayfa** (`/`): Öne çıkan ürünler ve kategoriler
- **Ürünler** (`/products`): Tüm ürünler listesi
- **Ürün Detayı** (`/products/:id`): Ürün detay sayfası
- **Arama** (`/search`): Ürün arama sonuçları
- **Sepet** (`/cart`): Sepet yönetimi
- **Giriş** (`/auth/login`): Kullanıcı girişi
- **Kayıt** (`/auth/register`): Yeni kullanıcı kaydı
- **Hesabım** (`/account`): Kullanıcı hesap yönetimi

## 🔧 API Endpoints

### Ürünler
- `GET /products` - Tüm ürünleri listele
- `GET /products/:id` - Ürün detayını getir
- `GET /products/category/:category` - Kategoriye göre ürünleri getir

### Sepet
- `GET /cart` - Sepet sayfası
- `POST /cart/add` - Sepete ürün ekle
- `POST /cart/remove` - Sepetten ürün çıkar
- `POST /cart/update` - Sepet miktarını güncelle
- `POST /cart/clear` - Sepeti temizle

### Kimlik Doğrulama
- `GET /auth/login` - Giriş sayfası
- `POST /auth/login` - Giriş işlemi
- `GET /auth/register` - Kayıt sayfası
- `POST /auth/register` - Kayıt işlemi
- `GET /auth/logout` - Çıkış işlemi

## 🎨 Özellikler

### Responsive Tasarım
- Mobil, tablet ve masaüstü uyumlu
- Bootstrap 5 grid sistemi
- Esnek ürün kartları

### Kullanıcı Deneyimi
- Toast bildirimleri
- Loading animasyonları
- Smooth scrolling
- Hover efektleri

### Performans
- Lazy loading
- Optimized images
- Efficient routing

## 🔒 Güvenlik

- Session-based authentication
- Input validation
- XSS protection
- CSRF protection (basic)

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

---

**Not**: Bu proje eğitim amaçlı oluşturulmuştur ve gerçek bir e-ticaret uygulaması değildir. 
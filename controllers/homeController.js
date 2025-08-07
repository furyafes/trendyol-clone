const Product = require('../models/Product');

class HomeController {
  // Ana sayfa
  async index(req, res) {
    try {
      // Öne çıkan ürünleri getir
      const featuredProducts = await Product.getFeaturedProducts();
      
      // İndirimli ürünleri getir
      const discountedProducts = await Product.getDiscountedProducts(6);
      
      // Kategorileri getir
      const allProducts = await Product.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      
      // Markaları getir
      const brands = [...new Set(allProducts.map(product => product.brand))];

      res.render('home', {
        title: 'Trendyol - Alışverişin Adresi',
        featuredProducts,
        discountedProducts,
        categories,
        brands
      });
    } catch (error) {
      console.error('Ana sayfa yüklenirken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Ana sayfa yüklenirken bir hata oluştu.' }
      });
    }
  }

  // Arama sayfası
  async search(req, res) {
    try {
      const { q, category, brand, minPrice, maxPrice, sort } = req.query;
      let products = [];

      // Arama sorgusu varsa
      if (q) {
        const searchOptions = {
          category,
          brand,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };

        // Sıralama seçenekleri
        if (sort) {
          switch (sort) {
            case 'price-asc':
              searchOptions.sortBy = 'price';
              searchOptions.sortOrder = 'asc';
              break;
            case 'price-desc':
              searchOptions.sortBy = 'price';
              searchOptions.sortOrder = 'desc';
              break;
            case 'rating':
              searchOptions.sortBy = 'rating';
              searchOptions.sortOrder = 'desc';
              break;
            case 'discount':
              searchOptions.sortBy = 'discount';
              searchOptions.sortOrder = 'desc';
              break;
            default:
              break;
          }
        }

        products = await Product.searchProducts(q, searchOptions);
      } else {
        // Tüm ürünleri getir
        const searchOptions = {
          category,
          brand,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        };

        if (sort) {
          switch (sort) {
            case 'price-asc':
              searchOptions.sortBy = 'price';
              searchOptions.sortOrder = 'asc';
              break;
            case 'price-desc':
              searchOptions.sortBy = 'price';
              searchOptions.sortOrder = 'desc';
              break;
            case 'rating':
              searchOptions.sortBy = 'rating';
              searchOptions.sortOrder = 'desc';
              break;
            case 'discount':
              searchOptions.sortBy = 'discount';
              searchOptions.sortOrder = 'desc';
              break;
            default:
              break;
          }
        }

        // Boş arama ile tüm ürünleri getir
        products = await Product.searchProducts('', searchOptions);
      }

      // Kategoriler ve markalar
      const allProducts = await Product.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      const brands = [...new Set(allProducts.map(product => product.brand))];

      res.render('search', {
        title: 'Arama Sonuçları',
        products,
        query: q,
        category,
        brand,
        minPrice,
        maxPrice,
        sort,
        categories,
        brands,
        totalResults: products.length
      });
    } catch (error) {
      console.error('Arama yapılırken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Arama yapılırken bir hata oluştu.' }
      });
    }
  }
}

module.exports = new HomeController(); 
const Product = require('../models/Product');

class ProductController {
  // Ürün listesi sayfası
  async index(req, res) {
    try {
      const { category, brand, sort } = req.query;
      let products = [];

      // Kategori veya marka filtresi varsa
      if (category) {
        products = await Product.getProductsByCategory(category);
      } else if (brand) {
        products = await Product.getProductsByBrand(brand);
      } else {
        products = await Product.getAllProducts();
      }

      // Sıralama
      if (sort) {
        switch (sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'discount':
            products.sort((a, b) => b.discount - a.discount);
            break;
          default:
            break;
        }
      }

      // Kategoriler ve markalar
      const allProducts = await Product.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      const brands = [...new Set(allProducts.map(product => product.brand))];

      res.render('products', {
        title: 'Ürünler',
        products,
        category,
        brand,
        sort,
        categories,
        brands,
        totalResults: products.length
      });
    } catch (error) {
      console.error('Ürün listesi yüklenirken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Ürün listesi yüklenirken bir hata oluştu.' }
      });
    }
  }

  // Ürün detay sayfası
  async show(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getProductById(id);

      if (!product) {
        return res.status(404).render('404', {
          title: 'Ürün Bulunamadı',
          message: 'Aradığınız ürün bulunamadı.'
        });
      }

      // Benzer ürünleri getir
      const similarProducts = await Product.getProductsByCategory(product.category);
      const filteredSimilarProducts = similarProducts
        .filter(p => p._id.toString() !== id)
        .slice(0, 4);

      res.render('product-detail', {
        title: product.name,
        product,
        similarProducts: filteredSimilarProducts
      });
    } catch (error) {
      console.error('Ürün detayı yüklenirken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Ürün detayı yüklenirken bir hata oluştu.' }
      });
    }
  }

  // Kategori sayfası
  async category(req, res) {
    try {
      const { category } = req.params;
      const { sort } = req.query;

      const products = await Product.getProductsByCategory(category);

      if (products.length === 0) {
        return res.status(404).render('404', {
          title: 'Kategori Bulunamadı',
          message: 'Aradığınız kategori bulunamadı.'
        });
      }

      // Sıralama
      if (sort) {
        switch (sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'discount':
            products.sort((a, b) => b.discount - a.discount);
            break;
          default:
            break;
        }
      }

      // Kategoriler ve markalar
      const allProducts = await Product.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      const brands = [...new Set(allProducts.map(product => product.brand))];

      res.render('products', {
        title: `${category} Ürünleri`,
        products,
        category,
        sort,
        categories,
        brands,
        totalResults: products.length
      });
    } catch (error) {
      console.error('Kategori sayfası yüklenirken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Kategori sayfası yüklenirken bir hata oluştu.' }
      });
    }
  }

  // Marka sayfası
  async brand(req, res) {
    try {
      const { brand } = req.params;
      const { sort } = req.query;

      const products = await Product.getProductsByBrand(brand);

      if (products.length === 0) {
        return res.status(404).render('404', {
          title: 'Marka Bulunamadı',
          message: 'Aradığınız marka bulunamadı.'
        });
      }

      // Sıralama
      if (sort) {
        switch (sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'discount':
            products.sort((a, b) => b.discount - a.discount);
            break;
          default:
            break;
        }
      }

      // Kategoriler ve markalar
      const allProducts = await Product.getAllProducts();
      const categories = [...new Set(allProducts.map(product => product.category))];
      const brands = [...new Set(allProducts.map(product => product.brand))];

      res.render('products', {
        title: `${brand} Ürünleri`,
        products,
        brand,
        sort,
        categories,
        brands,
        totalResults: products.length
      });
    } catch (error) {
      console.error('Marka sayfası yüklenirken hata:', error);
      res.status(500).render('error', {
        title: 'Hata',
        error: { message: 'Marka sayfası yüklenirken bir hata oluştu.' }
      });
    }
  }
}

module.exports = new ProductController(); 
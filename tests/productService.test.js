const productService = require('../src/services/productService');
const { sequelize, Product } = require('../src/models');

let createdProductIds = [];

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  if (createdProductIds.length > 0) {
    await Product.destroy({ where: { id: createdProductIds } });
  }
  await sequelize.close();
});

describe('Product Service - Müşteri Gereksinim Testleri', () => {
  test('Talep 1: Esnek Fiyat (JSON) kaydedilebilmeli', async () => {
    const uniqueSku = `SKU-PRICE-${Date.now()}`;

    const payload = {
      name: 'Esnek Fiyatlı Ürün',
      sku: uniqueSku,
      stock: 100,
      price: 500.0,
      priceMetadata: {
        wholesale: 400.0,
        discounted: 450.0,
        currency: 'USD',
        campaignName: 'BlackFriday',
      },
      isStockTracking: true,
    };

    const product = await productService.createProduct(payload);
    createdProductIds.push(product.id);

    expect(product.id).toBeDefined();
    expect(product.priceMetadata.wholesale).toBe(400.0);
    expect(product.priceMetadata.campaignName).toBe('BlackFriday');

    console.log('Esnek fiyat testi başarılı.');
  });

  test('Talep 2A: Stok Takibi AÇIK ise yetersiz stokta hata vermeli', async () => {
    const uniqueSku = `SKU-TRACK-ON-${Date.now()}`;

    const product = await productService.createProduct({
      name: 'Stoklu Ürün',
      sku: uniqueSku,
      stock: 5,
      price: 100,
      isStockTracking: true,
    });
    createdProductIds.push(product.id);

    await expect(productService.decreaseStock(product.id, 6)).rejects.toThrow(
      'InsufficientStock'
    );

    console.log('Yetersiz stok hatası testi başarılı.');
  });

  test('Talep 2B: Stok Takibi KAPALI ise stok 0 olsa bile işlem yapılabilmeli', async () => {
    const uniqueSku = `SKU-TRACK-OFF-${Date.now()}`;

    const product = await productService.createProduct({
      name: 'Hizmet Ürünü (Stoksuz)',
      sku: uniqueSku,
      stock: 0,
      price: 100,
      isStockTracking: false,
    });
    createdProductIds.push(product.id);

    const result = await productService.decreaseStock(product.id, 10);

    expect(result.id).toBe(product.id);
    expect(result.stock).toBe(0);

    console.log('Stok takibi olmayan ürün testi başarılı.');
  });
});

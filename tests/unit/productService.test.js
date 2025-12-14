const productService = require('../../src/services/productService');
const { Product } = require('../../src/models');

jest.mock('../../src/models');

describe('Product Service Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('createProduct fonksiyonu yeni ürün oluşturmalı', async () => {
    const mockProductData = { name: 'Test Ürün', sku: 'TST-001', price: 100 };
    const mockCreatedProduct = { id: 1, ...mockProductData };

    Product.create.mockResolvedValue(mockCreatedProduct);

    const result = await productService.createProduct(mockProductData);

    expect(Product.create).toHaveBeenCalledTimes(1); 
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({
      sku: 'TST-001'
    })); 
    expect(result.id).toBe(1); 
  });

  it('SKU çakışması varsa hata fırlatmalı', async () => {
    Product.create.mockRejectedValue(new Error('SequelizeUniqueConstraintError'));

    const mockProductData = { name: 'Test Ürün', sku: 'TST-001' };

    await expect(productService.createProduct(mockProductData))
      .rejects
      .toThrow('SequelizeUniqueConstraintError');
  });
});
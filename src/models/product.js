'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {}
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      isStockTracking: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Varsayılan olarak takip et
      },
      // MÜŞTERİ TALEBİ 2: "Birden fazla fiyat türü" (Esnek JSON Çözümü)
      priceMetadata: {
        type: DataTypes.JSON, // Postgres JSONB gücü
        defaultValue: {},
        // Örnek Veri: { "wholesale": 80.50, "discounted": 90.00, "currency": "USD" }
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products', // Küçük harf standardı
      underscored: true,
    }
  );
  return Product;
};

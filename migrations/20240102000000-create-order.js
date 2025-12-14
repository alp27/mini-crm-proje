'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers', // Veritabanındaki tablo adı
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Müşteri silinirse siparişleri de silinsin (veya SET NULL yapılabilir)
      },
      status: {
        type: Sequelize.ENUM(
          'PENDING',
          'PREPARING',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED'
        ),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};

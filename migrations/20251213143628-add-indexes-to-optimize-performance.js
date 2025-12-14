'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('customers', ['email'], {
      name: 'idx_customers_email',
      unique: true,
    });
    await queryInterface.addIndex('customers', ['phone'], {
      name: 'idx_customers_phone',
      unique: true,
    });

    await queryInterface.addIndex('products', ['sku'], {
      name: 'idx_products_sku',
      unique: true,
    });

    await queryInterface.addIndex('products', ['name'], {
      name: 'idx_products_name',
    });

    await queryInterface.addIndex('orders', ['customer_id'], {
      name: 'idx_orders_customer_id',
    });
    await queryInterface.addIndex('orders', ['status'], {
      name: 'idx_orders_status',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('customers', 'idx_customers_email');
    await queryInterface.removeIndex('customers', 'idx_customers_phone');
    await queryInterface.removeIndex('products', 'idx_products_sku');
    await queryInterface.removeIndex('products', 'idx_products_name');
    await queryInterface.removeIndex('orders', 'idx_orders_customer_id');
    await queryInterface.removeIndex('orders', 'idx_orders_status');
  },
};

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Bir müşteri seçilmelidir.' },
        },
      },
      status: {
        type: DataTypes.ENUM(
          'PENDING',
          'PREPARING',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED'
        ),
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
          isIn: {
            args: [
              ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
            ],
            msg: 'Geçersiz sipariş durumu.',
          },
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false, // Tutar boş olamaz
        defaultValue: 0.0,
      },
    },
    {
      tableName: 'orders',
      underscored: true,
      timestamps: true,
    }
  );

  // İlişki Tanımı (Association)
  Order.associate = function (models) {
    // Bir sipariş, bir müşteriye aittir.
    Order.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer',
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items',
    });
  };

  return Order;
};

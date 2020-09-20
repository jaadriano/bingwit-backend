'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    stock: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    initial_stock: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    price_per_kilo: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {});
  Product.associate = function(models) {
    // associations can be defined here
    Product.belongsTo(models.Product_type, {
      foreignKey: 'product_type_id'
    });
    Product.belongsTo(models.User, {
      foreignKey: 'producer_user_id'
    });
  };
  return Product;
};
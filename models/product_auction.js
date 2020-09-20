'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product_auction = sequelize.define('Product_auction', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    min_price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    max_price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {});
  Product_auction.associate = function(models) {
    // associations can be defined here
    Product_auction.belongsTo(models.Product, {
    	foreignKey: 'product_id'
    })
  };
  return Product_auction;
};
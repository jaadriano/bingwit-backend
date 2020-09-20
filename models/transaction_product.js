'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction_product = sequelize.define('Transaction_product', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    quantity: {
    	type: DataTypes.INTEGER,
    	allowNull: false
    },
    amount: {
    	type: DataTypes.FLOAT,
    	allowNull: false
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deletedAt: {
    	type: DataTypes.DATE,
    	allowNull:true
    }
  }, {});
  Transaction_product.associate = function(models) {
    // associations can be defined here
    Transaction_product.belongsTo(models.Transaction, {
    	foreignKey: 'transaction_id'
    });

    Transaction_product.belongsTo(models.Product, {
    	foreignKey: 'product_id'
    })
  };
  return Transaction_product;
};
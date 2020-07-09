'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product_type = sequelize.define('Product_type', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    name: {
    	type: DataTypes.STRING(64),
    	allowNull: false
    },
    createdAt: {
    	type: DataTypes.DATE,
    	allowNull: true
    },
    deletedAt: {
    	type: DataTypes.DATE,
    	allowNull: true
    }
  }, {});
  Product_type.associate = function(models) {
    // associations can be defined here
    Product_type.hasMany(models.Product_type_alias, {
      foreignKey: 'product_typeId',
      as: 'product_type_alias'
    });

  };
  return Product_type;
};
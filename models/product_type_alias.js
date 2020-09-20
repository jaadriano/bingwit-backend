'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product_type_alias = sequelize.define('Product_type_alias', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    alias: {
    	type: DataTypes.STRING,
    	allowNull: false
    },
    deletedAt: {
    	type: DataTypes.STRING,
    	allowNull: true
    }
  }, {});
  Product_type_alias.associate = function(models) {
    // associations can be defined here
    Product_type_alias.belongsTo(models.Product_type, {
    	foreignKey: 'product_typeId'
    })
  };
  return Product_type_alias;
};
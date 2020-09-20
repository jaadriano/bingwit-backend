'use strict';
module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    area_address: {
    	type:DataTypes.STRING,
    	allowNull:false
    },
    deletedAt: {
    	type:DataTypes.DATE,
    	allowNull:true
    }
  }, {});
  Area.associate = function(models) {
    // associations can be defined here
    Area.hasMany(models.User, {
    	foreignKey: 'area_id',
    	as: 'user'
    });
  };
  return Area;
};
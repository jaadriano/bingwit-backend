'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    feedback: {
    	type: DataTypes.TEXT,
    	allowNull: false
    },
    deletedAt: {
    	type: DataTypes.DATE,
    	allowNull: true
    }
  }, {});
  Report.associate = function(models) {
    // associations can be defined here

    Report.belongsTo(models.User, {
      foreignKey: 'consumer_id',
      as: 'consumer'
    });

    Report.belongsTo(models.User, {
      foreignKey: 'producer_id',
      as: 'producer'
    });
  };
  return Report;
};
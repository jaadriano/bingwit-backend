'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rule = sequelize.define('Rule', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    description: {
    	type: DataTypes.TEXT,
    	allowNull: false
    },
    deletedAt: {
    	type: DataTypes.DATE,
    	allowNull: true
    }
  }, {});
  Rule.associate = function(models) {
    // associations can be defined here
  };
  return Rule;
};
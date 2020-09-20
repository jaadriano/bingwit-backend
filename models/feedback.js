'use strict';
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    feedback: {
    	type: DataTypes.TEXT,
    	allowedNull: false
    },
    deletedAt: {
    	type: DataTypes.DATE,
    	allowed: true
    }
  }, {});
  Feedback.associate = function(models) {
    // associations can be defined here
    Feedback.belongsTo(models.User, {
    	foreignKey: 'user_id',
    });
  };
  return Feedback;
};
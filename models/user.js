'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false
    },
    type: {
      type: DataTypes.STRING(16),
      allowNull:false
    },
    full_name: {
      type:DataTypes.STRING(128),
      allowNull:false
    },
    username: {
      type:DataTypes.STRING(64),
      allowNull:false,
      unique: true
    },
    password: {
      type:DataTypes.STRING(64),
      allowNull:false
    },
    contact_number: {
      type:DataTypes.STRING(64),
      allowNull:false,
      unique: true
    },
    address: {
      type:DataTypes.STRING(128),
      allowNull:false
    },
    image_url: {
      type:DataTypes.STRING(256),
      allowNull:true,
      unique: true
    },
    rating: {
      type:DataTypes.INTEGER,
      allowNull:true
    },
    status: {
      type:DataTypes.STRING(16),
      allowNull:true,
    },
    verification_code: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    password_reset_code: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    password_reset_link: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    code_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvedAt: {
      type:DataTypes.DATE,
      allowNull:true,
    },
    deletedAt: {
      type:DataTypes.DATE,
      allowNull:true
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(models.Area, {
      foreignKey: 'area_id'
    });

    // User.belongsTo(models.User, {
    //   foreignKey: 'id',
    //   as: 'consumer'
    // });

    // User.belongsTo(models.Report, {
    //   foreignKey: 'consumer_id',
    //   as: 'reporter'
    // });

    // User.hasMany(models.Feedback, {
    //   foreignKey: 'user_id',
    //   as: 'feedback'
    // });
  };
  return User;
};
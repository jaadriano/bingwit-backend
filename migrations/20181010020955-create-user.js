'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(16)
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING(128)
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(64),
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(64)
      },
      contact_number: {
        allowNull: false,
        type: Sequelize.STRING(64),
        unique: true
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING(128)
      },
      image_url: {
        allowNull: true,
        type: Sequelize.STRING(256),
        unique: true
      },
      area_id: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Areas',
          key: 'id',
          as: 'area_id'
        }
      },
      rating: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING(16),
        defaultValue: null
      },      
      verification_code: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      password_reset_code: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      password_reset_link: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      code_expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approvedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
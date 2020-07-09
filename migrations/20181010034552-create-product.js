'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      image_url: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true
      },
      stock: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      initial_stock: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      price_per_kilo: {
        allowNull: true,
        type: Sequelize.DECIMAL(12,2)
      },
      producer_user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
          as: 'producer_user_id' 
        }
      },
      product_type_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Product_types',
          key: 'id',
          as: 'product_type_id'
        }
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
    return queryInterface.dropTable('Products');
  }
};
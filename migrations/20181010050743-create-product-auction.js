'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Product_auctions', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false
      },
      product_id: {
        allowNull: false,
        type: Sequelize.UUID,
        unique: true,
        references: {
          model: 'Products',
          key: 'id',
          as: 'product_id'
        }
      },
      min_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(12,2)
      },
      max_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(12,2)
      },
      start: {
        allowNull: false,
        type: Sequelize.DATE
      },
      end: {
        allowNull: false,
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Product_auctions');
  }
};
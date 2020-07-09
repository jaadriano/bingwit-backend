'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transaction_products', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      amount: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      rating: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      comment: {
        allowNull: true,
        type: Sequelize.STRING
      },
      transaction_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Transactions',
          key: 'id',
          as: 'transaction_id'
        }
      },
      product_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Products',
          key: 'id',
          as: 'product_id'
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
    return queryInterface.dropTable('Transaction_products');
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Product_type_aliases', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false
      },
      alias: {
        allowNull: false,
        type: Sequelize.STRING
      },
      product_typeId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'Product_types',
          key: 'id',
          as: 'product_typeId'
        }
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Product_type_aliases');
  }
};
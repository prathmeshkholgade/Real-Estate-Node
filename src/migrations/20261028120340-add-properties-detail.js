'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'state', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'locality', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Properties', 'address');
    await queryInterface.removeColumn('Properties', 'locality');
    await queryInterface.removeColumn('Properties', 'city');
    await queryInterface.removeColumn('Properties', 'state');
    await queryInterface.removeColumn('Properties', 'country');
    await queryInterface.removeColumn('Properties', 'postal_code');
  },
};
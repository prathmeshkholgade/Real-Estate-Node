'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FacilityManagementCompanies', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('FacilityManagementCompanies', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.changeColumn('FacilityManagementCompanies', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FacilityManagementCompanies', 'created_by');
    await queryInterface.removeColumn('FacilityManagementCompanies', 'password');
    await queryInterface.changeColumn('FacilityManagementCompanies', 'phone', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};

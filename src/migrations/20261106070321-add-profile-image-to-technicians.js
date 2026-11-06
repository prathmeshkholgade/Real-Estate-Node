'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Technicians", "profile_image", {
      type: Sequelize.STRING(500),
      allowNull: true
    })
    /**
     * Add altering commands here.
     *
     * Example:
     awa
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Technicians", "profile_image")
    /**
     * Add reverting commands here.
     *
     * Example:
     * 
     * await queryInterface.dropTable('users');
     */
  }
};

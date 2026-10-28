
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const currentDate = new Date();

    const roles = [
      'Buyer',
      'Agent',
      'Developer',
      'Facility Manager',
      'Technician',
      'Property Owner'
    ];

    const roleData = roles.map((roleName) => ({
      role_name: roleName,
      createdAt: currentDate,
      updatedAt: currentDate
    }));

    await queryInterface.bulkInsert('Roles', roleData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      role_name: [
        'Buyer',
        'Agent',
        'Developer',
        'Facility Manager',
        'Technician',
        'Property Owner'
      ]
    }, {});
  }
};

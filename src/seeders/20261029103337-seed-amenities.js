
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const amenities = [
      { name: "Swimming Pool", category: "Recreation" },
      { name: "Gymnasium", category: "Fitness" },
      { name: "Covered Parking", category: "Parking" },
      { name: "24/7 Security", category: "Security" },
      { name: "Power Backup", category: "Utilities" },
      { name: "Elevator", category: "Convenience" },
      { name: "Garden", category: "Outdoor" },
      { name: "Children's Play Area", category: "Recreation" },
      { name: "Clubhouse", category: "Recreation" },
      { name: "CCTV Surveillance", category: "Security" },
      { name: "Wi-Fi", category: "Connectivity" },
      { name: "Air Conditioning", category: "Comfort" },
      { name: "Balcony", category: "Outdoor" },
      { name: "Rainwater Harvesting", category: "Sustainability" },
      { name: "Fire Safety", category: "Safety" },
      { name: "Visitor Parking", category: "Parking" },
      { name: "Jogging Track", category: "Fitness" },
      { name: "Indoor Games Room", category: "Recreation" },
      { name: "Tennis Court", category: "Sports" },
      { name: "Basketball Court", category: "Sports" },
      { name: "Yoga Room", category: "Fitness" },
      { name: "Pet-Friendly Area", category: "Pet Facilities" },
      { name: "Laundry Facility", category: "Convenience" },
      { name: "Water Supply", category: "Utilities" },
      { name: "Solar Panels", category: "Sustainability" },
      { name: "Intercom", category: "Security" },
      { name: "Modular Kitchen", category: "Interior" },
      { name: "Wardrobes", category: "Interior" },
      { name: "Smoke Detector", category: "Safety" },
      { name: "Sewage Treatment Plant", category: "Utilities" },
    ];

    await queryInterface.bulkInsert(
      "Amenities",
      amenities.map((amenity) => ({
        ...amenity,
        createdAt: now,
        updatedAt: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Amenities", null, {});
  },
};

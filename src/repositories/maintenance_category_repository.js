const BaseRepository = require("./base_repository");
const { MaintenanceCategory } = require("../models");

class MaintenanceCategoryRepository extends BaseRepository {
    constructor() {
        super(MaintenanceCategory);
    }

    async findActiveCategories() {
        return await this.findAll({
            where: { status: "active" },
            order: [["id", "ASC"]],
        });
    }
}

module.exports = new MaintenanceCategoryRepository();


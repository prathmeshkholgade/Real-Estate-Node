const BaseRepository = require("./base_repository");
const { MaintenanceRequestMedia } = require("../models");

class MaintenanceRequestMediaRepository extends BaseRepository {
    constructor() {
        super(MaintenanceRequestMedia);
    }
}

module.exports = new MaintenanceRequestMediaRepository();


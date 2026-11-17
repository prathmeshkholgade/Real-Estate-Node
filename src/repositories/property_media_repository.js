const BaseRepository = require("./base_repository");
const { PropertyMedia } = require("../models");

class PropertyMediaRepository extends BaseRepository {
    constructor() {
        super(PropertyMedia);
    }
}

module.exports = new PropertyMediaRepository();


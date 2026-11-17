const BaseRepository = require("./base_repository");
const { PropertyDocument } = require("../models");

class PropertyDocumentRepository extends BaseRepository {
    constructor() {
        super(PropertyDocument);
    }
}

module.exports = new PropertyDocumentRepository();


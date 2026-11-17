const BaseRepository = require("./base_repository");
const { PropertyConfiguration } = require("../models");

class PropertyConfigurationRepository extends BaseRepository {
    constructor() {
        super(PropertyConfiguration);
    }

    async findByPropertyId(propertyId) {
        return await this.findOne({
            property_id: propertyId,
        });
    }
}

module.exports = new PropertyConfigurationRepository();


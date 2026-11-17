const BaseRepository = require("./base_repository");
const { PropertyDetail } = require("../models");

class PropertyDetailRepository extends BaseRepository {
    constructor() {
        super(PropertyDetail);
    }

    async findByPropertyId(propertyId) {
        return await this.findOne({
            property_id: propertyId,
        });
    }
}

module.exports = new PropertyDetailRepository();


const BaseRepository = require("./base_repository");
const { PropertyFacilityAssignment, FacilityManagementCompany } = require("../models");

class PropertyFacilityAssignmentRepository extends BaseRepository {
    constructor() {
        super(PropertyFacilityAssignment);
    }

    async findActiveAssignment(propertyId) {
        return await this.findOne(
            {
                property_id: propertyId,
                status: "active",
            },
            {
                include: [
                    {
                        model: FacilityManagementCompany,
                        as: "facilityCompany",
                    },
                ],
            }
        );
    }
}

module.exports = new PropertyFacilityAssignmentRepository();


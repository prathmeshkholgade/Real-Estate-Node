const BaseRepository = require("./base_repository");
const {
    FacilityManagementCompany,
    PropertyFacilityAssignment,
    Property,
    User,
} = require("../models");

class FacilityCompanyRepository extends BaseRepository {
    constructor() {
        super(FacilityManagementCompany);
    }

    async findByEmail(email) {
        return await this.findOne({ email });
    }

    async findCompanyWithDetails(id) {
        return await this.findById(id, {
            attributes: [
                "id",
                "company_name",
                "email",
                "phone",
                "address",
                "status",
                "created_by",
                "createdAt",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "fullName", "email"],
                },
                {
                    model: PropertyFacilityAssignment,
                    as: "propertyAssignments",
                    include: [
                        {
                            model: Property,
                            as: "property",
                            attributes: ["id", "title", "address", "city", "property_type"],
                        },
                    ],
                },
            ],
        });
    }

    async findCompanyProfile(id) {
        return await this.findById(id, {
            attributes: [
                "id",
                "company_name",
                "email",
                "phone",
                "address",
                "status",
                "created_by",
                "createdAt",
            ],
            include: [
                {
                    model: PropertyFacilityAssignment,
                    as: "propertyAssignments",
                    include: [
                        {
                            model: Property,
                            as: "property",
                            attributes: ["id", "title", "address", "city", "property_type", "price"],
                        },
                        {
                            model: User,
                            as: "assignedBy",
                            attributes: ["id", "fullName", "email", "phone"],
                        },
                    ],
                },
            ],
        });
    }

    async findFacilities(where, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where,
            attributes: [
                "id",
                "company_name",
                "email",
                "phone",
                "address",
                "status",
                "created_by",
                "createdAt",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "fullName", "email"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }

    async findOwnerCreated(ownerId, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where: { created_by: ownerId },
            attributes: [
                "id",
                "company_name",
                "email",
                "phone",
                "address",
                "status",
                "created_by",
                "createdAt",
            ],
            include: [
                {
                    model: PropertyFacilityAssignment,
                    as: "propertyAssignments",
                    attributes: ["id", "property_id", "status"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }
}

module.exports = new FacilityCompanyRepository();


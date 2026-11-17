const BaseRepository = require("./base_repository");
const {
    MaintenanceRequest,
    MaintenanceCategory,
    MaintenanceRequestMedia,
    TechnicianTask,
    TechnicianTaskMedia,
    TechnicianTaskHistory,
    Property,
    PropertyFacilityAssignment,
    FacilityManagementCompany,
    Technician,
    User,
} = require("../models");

class MaintenanceRequestRepository extends BaseRepository {
    constructor() {
        super(MaintenanceRequest);
    }

    async findOwnerRequests(where, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "address", "city", "property_type"],
                },
                {
                    model: MaintenanceCategory,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: MaintenanceRequestMedia,
                    as: "media",
                    attributes: ["id", "media_url", "media_type"],
                },
                {
                    model: TechnicianTask,
                    as: "technicianTask",
                    attributes: ["id", "status", "scheduled_at", "started_at", "completed_at"],
                    include: [
                        {
                            model: Technician,
                            as: "technician",
                            attributes: ["id", "specialization"],
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "fullName", "phone"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }

    async findCompanyRequests(where, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "address", "city", "property_type"],
                },
                {
                    model: User,
                    as: "requester",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: MaintenanceCategory,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: MaintenanceRequestMedia,
                    as: "media",
                    attributes: ["id", "media_url", "media_type"],
                },
                {
                    model: TechnicianTask,
                    as: "technicianTask",
                    attributes: ["id", "status", "scheduled_at", "started_at", "completed_at"],
                    include: [
                        {
                            model: Technician,
                            as: "technician",
                            attributes: ["id", "specialization"],
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "fullName", "phone"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }

    async findRequestWithFullDetails(requestId) {
        return await this.findById(requestId, {
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "address", "city", "property_type", "price", "status"],
                },
                {
                    model: User,
                    as: "requester",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: MaintenanceCategory,
                    as: "category",
                    attributes: ["id", "name", "description"],
                },
                {
                    model: MaintenanceRequestMedia,
                    as: "media",
                    attributes: ["id", "media_url", "media_type", "createdAt"],
                },
                {
                    model: PropertyFacilityAssignment,
                    as: "facilityAssignment",
                    include: [
                        {
                            model: FacilityManagementCompany,
                            as: "company",
                            attributes: ["id", "company_name", "email", "phone"],
                        },
                    ],
                },
                {
                    model: TechnicianTask,
                    as: "technicianTask",
                    include: [
                        {
                            model: Technician,
                            as: "technician",
                            include: [
                                {
                                    model: User,
                                    as: "user",
                                    attributes: ["id", "fullName", "email", "phone"],
                                },
                            ],
                        },
                        {
                            model: TechnicianTaskMedia,
                            as: "media",
                        },
                        {
                            model: TechnicianTaskHistory,
                            as: "statusHistory",
                            include: [
                                {
                                    model: User,
                                    as: "changer",
                                    attributes: ["id", "fullName", "email"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }
}

module.exports = new MaintenanceRequestRepository();


const BaseRepository = require("./base_repository");
const {
    TechnicianTask,
    Technician,
    User,
    MaintenanceRequest,
    MaintenanceCategory,
    Property,
    PropertyFacilityAssignment,
    FacilityManagementCompany,
    TechnicianTaskMedia,
    TechnicianTaskHistory,
} = require("../models");

class TechnicianTaskRepository extends BaseRepository {
    constructor() {
        super(TechnicianTask);
    }

    async findActiveTaskByRequestId(requestId) {
        return await this.findOne({
            maintenance_request_id: requestId,
        });
    }

    async findCompanyTasks(where, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                    include: [
                        {
                            model: Property,
                            as: "property",
                            attributes: ["id", "title", "address", "city"],
                        },
                        {
                            model: MaintenanceCategory,
                            as: "category",
                            attributes: ["id", "name"],
                        },
                        {
                            model: User,
                            as: "requester",
                            attributes: ["id", "fullName", "email", "phone"],
                        },
                    ],
                },
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
                    model: User,
                    as: "assigner",
                    attributes: ["id", "fullName", "email"],
                },
            ],
        });
    }

    async findTechnicianTasks(where, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                    include: [
                        {
                            model: Property,
                            as: "property",
                            attributes: ["id", "title", "address", "city"],
                        },
                        {
                            model: MaintenanceCategory,
                            as: "category",
                            attributes: ["id", "name"],
                        },
                        {
                            model: User,
                            as: "requester",
                            attributes: ["id", "fullName", "phone"],
                        },
                    ],
                },
                {
                    model: User,
                    as: "assigner",
                    attributes: ["id", "fullName", "email"],
                },
            ],
        });
    }

    async findTaskWithAllDetails(taskId) {
        return await this.findById(taskId, {
            include: [
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                    include: [
                        {
                            model: Property,
                            as: "property",
                        },
                        {
                            model: MaintenanceCategory,
                            as: "category",
                        },
                        {
                            model: User,
                            as: "requester",
                            attributes: ["id", "fullName", "email", "phone"],
                        },
                        {
                            model: PropertyFacilityAssignment,
                            as: "facilityAssignment",
                            include: [
                                {
                                    model: FacilityManagementCompany,
                                    as: "company",
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Technician,
                    as: "technician",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "fullName", "email", "phone"],
                        },
                        {
                            model: FacilityManagementCompany,
                            as: "company",
                        },
                    ],
                },
                {
                    model: User,
                    as: "assigner",
                    attributes: ["id", "fullName", "email"],
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
        });
    }
}

module.exports = new TechnicianTaskRepository();


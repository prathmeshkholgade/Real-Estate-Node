const { Op, Sequelize } = require("sequelize");
const {
    MaintenanceCategory,
    MaintenanceRequest,
    MaintenanceRequestMedia,
    TechnicianTask,
    TechnicianTaskMedia,
    TechnicianTaskHistory,
    Property,
    PropertyOwnership,
    PropertyFacilityAssignment,
    FacilityManagementCompany,
    Technician,
    User,
    sequelize,
} = require("../models");
const ExpressError = require("../utils/express_error");
const uploadToCloudinary = require("../utils/upload_to_cloudinary");

const getMaintenanceCategoriesService = async () => {
    return await MaintenanceCategory.findAll({
        where: { status: "active" },
        order: [["id", "ASC"]],
    });
};

const createMaintenanceRequestService = async (userId, data, files = []) => {
    const { property_id, category_id, title, description, priority = "medium" } = data;

    const property = await Property.findByPk(property_id);
    if (!property) {
        throw new ExpressError(404, "Property not found");
    }

    const category = await MaintenanceCategory.findByPk(category_id);
    if (!category || category.status !== "active") {
        throw new ExpressError(404, "Active maintenance category not found");
    }

    const activeOwnership = await PropertyOwnership.findOne({
        where: {
            property_id,
            owner_id: userId,
            status: "active",
        },
    });

    const isDirectOwner = property.user_id === userId;
    if (!activeOwnership && !isDirectOwner) {
        throw new ExpressError(
            403,
            "Only the current active owner of this property can create maintenance requests"
        );
    }

    const activeAssignment = await PropertyFacilityAssignment.findOne({
        where: {
            property_id,
            status: "active",
        },
    });

    if (!activeAssignment) {
        throw new ExpressError(
            400,
            "This property does not have an active facility management company assigned. Maintenance requests cannot be submitted."
        );
    }

    const ownershipId = activeOwnership ? activeOwnership.id : null;

    const request = await MaintenanceRequest.create({
        property_id,
        requested_by: userId,
        ownership_id: ownershipId,
        facility_assignment_id: activeAssignment.id,
        category_id,
        title,
        description,
        priority: priority.toLowerCase(),
        status: "pending",
    });

    if (files && files.length > 0) {
        const mediaPromises = files.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file, "maintenance/requests");
            const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
            return await MaintenanceRequestMedia.create({
                maintenance_request_id: request.id,
                media_url: uploadResult.url,
                media_type: mediaType,
            });
        });
        await Promise.all(mediaPromises);
    }

    return await MaintenanceRequest.findByPk(request.id, {
        include: [
            {
                model: Property,
                as: "property",
                attributes: ["id", "title", "address", "city", "property_type"],
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
        ],
    });
};

const getOwnerMaintenanceRequestsService = async (userId, query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const where = { requested_by: userId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.property_id) where.property_id = parseInt(query.property_id, 10);
    if (query.category_id) where.category_id = parseInt(query.category_id, 10);

    const { count, rows } = await MaintenanceRequest.findAndCountAll({
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

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const getMaintenanceRequestByIdService = async (requestId, authUser = null, facility = null) => {
    const request = await MaintenanceRequest.findByPk(requestId, {
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
                                as: "changedBy",
                                attributes: ["id", "fullName"],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Maintenance request not found");
    }

    if (facility) {
        if (
            !request.facilityAssignment ||
            request.facilityAssignment.company_id !== facility.id
        ) {
            throw new ExpressError(
                403,
                "You are not authorized to view this maintenance request"
            );
        }
    } else if (authUser) {
        const isRequester = request.requested_by === authUser.id;
        const isPropertyOwner =
            request.property && request.property.user_id === authUser.id;
        const isAssignedTech =
            request.technicianTask &&
            request.technicianTask.technician &&
            request.technicianTask.technician.user_id === authUser.id;

        if (!isRequester && !isPropertyOwner && !isAssignedTech) {
            throw new ExpressError(
                403,
                "You are not authorized to view this maintenance request"
            );
        }
    }

    return request;
};

const cancelMaintenanceRequestService = async (requestId, userId) => {
    const request = await MaintenanceRequest.findByPk(requestId);
    if (!request) {
        throw new ExpressError(404, "Maintenance request not found");
    }

    if (request.requested_by !== userId) {
        throw new ExpressError(
            403,
            "Only the owner who created this maintenance request can cancel it"
        );
    }

    if (request.status !== "pending") {
        throw new ExpressError(
            400,
            `Cannot cancel a maintenance request with status "${request.status}". Only pending requests can be cancelled.`
        );
    }

    request.status = "cancelled";
    await request.save();

    return request;
};

const getCompanyMaintenanceRequestsService = async (facilityId, query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const assignments = await PropertyFacilityAssignment.findAll({
        where: { company_id: facilityId },
        attributes: ["id"],
    });

    const assignmentIds = assignments.map((a) => a.id);
    if (assignmentIds.length === 0) {
        return { total: 0, page, limit, totalPages: 0, data: [] };
    }

    const where = { facility_assignment_id: assignmentIds };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.property_id) where.property_id = parseInt(query.property_id, 10);
    if (query.category_id) where.category_id = parseInt(query.category_id, 10);

    const { count, rows } = await MaintenanceRequest.findAndCountAll({
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

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const getCompanyTechniciansService = async (facilityId) => {
    return await Technician.findAll({
        where: { company_id: facilityId, status: "active" },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "fullName", "email", "phone", "role_id"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

const assignTechnicianTaskService = async (facilityId, data) => {
    const { maintenance_request_id, technician_id, instructions, scheduled_at } = data;

    const request = await MaintenanceRequest.findByPk(maintenance_request_id, {
        include: [
            {
                model: PropertyFacilityAssignment,
                as: "facilityAssignment",
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Maintenance request not found");
    }

    if (
        !request.facilityAssignment ||
        request.facilityAssignment.company_id !== facilityId
    ) {
        throw new ExpressError(
            403,
            "You are not authorized to assign technicians to this maintenance request"
        );
    }

    if (request.status === "completed" || request.status === "cancelled") {
        throw new ExpressError(
            400,
            `Cannot assign technician to a ${request.status} maintenance request`
        );
    }

    const technician = await Technician.findOne({
        where: { id: technician_id, company_id: facilityId },
        include: [{ model: User, as: "user" }],
    });

    if (!technician) {
        throw new ExpressError(
            404,
            "Technician not found in your facility company"
        );
    }

    if (technician.status !== "active") {
        throw new ExpressError(400, "Technician account is not active");
    }

    const existingTask = await TechnicianTask.findOne({
        where: { maintenance_request_id },
    });

    if (existingTask) {
        throw new ExpressError(
            409,
            "A technician task has already been assigned for this maintenance request. Use the reassign endpoint to change the technician."
        );
    }

    const t = await sequelize.transaction();

    try {
        const task = await TechnicianTask.create(
            {
                maintenance_request_id,
                technician_id,
                assigned_by: facilityId,
                instructions: instructions || null,
                scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
                status: "assigned",
            },
            { transaction: t }
        );

        request.status = "assigned";
        await request.save({ transaction: t });

        await TechnicianTaskHistory.create(
            {
                technician_task_id: task.id,
                changed_by: technician.user_id,
                old_status: null,
                new_status: "assigned",
                remarks: "Task assigned to technician by facility manager",
            },
            { transaction: t }
        );

        await t.commit();

        return await TechnicianTask.findByPk(task.id, {
            include: [
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                    include: [
                        { model: Property, as: "property" },
                        { model: MaintenanceCategory, as: "category" },
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
                    model: TechnicianTaskHistory,
                    as: "statusHistory",
                },
            ],
        });
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getCompanyTechnicianTasksService = async (facilityId, query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const companyTechs = await Technician.findAll({
        where: { company_id: facilityId },
        attributes: ["id"],
    });

    const techIds = companyTechs.map((t) => t.id);
    if (techIds.length === 0) {
        return { total: 0, page, limit, totalPages: 0, data: [] };
    }

    const where = { technician_id: techIds };
    if (query.status) where.status = query.status;
    if (query.technician_id) where.technician_id = parseInt(query.technician_id, 10);

    const { count, rows } = await TechnicianTask.findAndCountAll({
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
                model: TechnicianTaskMedia,
                as: "media",
            },
            {
                model: TechnicianTaskHistory,
                as: "statusHistory",
            },
        ],
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const getTechnicianTaskByIdService = async (taskId, authUser = null, facility = null, technician = null) => {
    const task = await TechnicianTask.findByPk(taskId, {
        include: [
            {
                model: MaintenanceRequest,
                as: "maintenanceRequest",
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
                        attributes: ["id", "company_name", "email", "phone"],
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
                        as: "changedBy",
                        attributes: ["id", "fullName"],
                    },
                ],
            },
        ],
    });

    if (!task) {
        throw new ExpressError(404, "Technician task not found");
    }

    if (facility) {
        if (!task.technician || task.technician.company_id !== facility.id) {
            throw new ExpressError(
                403,
                "You are not authorized to view tasks for another facility company"
            );
        }
    } else if (technician) {
        if (task.technician_id !== technician.id) {
            throw new ExpressError(
                403,
                "You are not authorized to view tasks assigned to another technician"
            );
        }
    } else if (authUser) {
        const isOwner =
            task.maintenanceRequest &&
            task.maintenanceRequest.requested_by === authUser.id;
        const isTechUser =
            task.technician && task.technician.user_id === authUser.id;

        if (!isOwner && !isTechUser) {
            throw new ExpressError(
                403,
                "You are not authorized to view this technician task"
            );
        }
    }

    return task;
};

const reassignTechnicianTaskService = async (taskId, facilityId, data) => {
    const { technician_id, instructions, scheduled_at } = data;

    const task = await TechnicianTask.findByPk(taskId, {
        include: [
            {
                model: Technician,
                as: "technician",
            },
            {
                model: MaintenanceRequest,
                as: "maintenanceRequest",
            },
        ],
    });

    if (!task) {
        throw new ExpressError(404, "Technician task not found");
    }

    if (!task.technician || task.technician.company_id !== facilityId) {
        throw new ExpressError(
            403,
            "You are not authorized to reassign tasks for another facility company"
        );
    }

    if (task.status === "completed") {
        throw new ExpressError(400, "Cannot reassign a completed technician task");
    }

    const newTech = await Technician.findOne({
        where: { id: technician_id, company_id: facilityId },
        include: [{ model: User, as: "user" }],
    });

    if (!newTech) {
        throw new ExpressError(
            404,
            "New technician not found in your facility company"
        );
    }

    if (newTech.status !== "active") {
        throw new ExpressError(400, "New technician account is not active");
    }

    const t = await sequelize.transaction();

    try {
        const oldStatus = task.status;
        task.technician_id = technician_id;
        if (instructions !== undefined) task.instructions = instructions;
        if (scheduled_at !== undefined) task.scheduled_at = scheduled_at ? new Date(scheduled_at) : null;
        task.status = "assigned";
        await task.save({ transaction: t });

        if (task.maintenanceRequest) {
            task.maintenanceRequest.status = "assigned";
            await task.maintenanceRequest.save({ transaction: t });
        }

        await TechnicianTaskHistory.create(
            {
                technician_task_id: task.id,
                changed_by: newTech.user_id,
                old_status: oldStatus,
                new_status: "assigned",
                remarks: `Task reassigned to technician ${newTech.user?.fullName || technician_id}`,
            },
            { transaction: t }
        );

        await t.commit();

        return await TechnicianTask.findByPk(task.id, {
            include: [
                {
                    model: Technician,
                    as: "technician",
                    include: [{ model: User, as: "user" }],
                },
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                },
                {
                    model: TechnicianTaskHistory,
                    as: "statusHistory",
                },
            ],
        });
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getTechnicianMyTasksService = async (technicianId, query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const where = { technician_id: technicianId };
    if (query.status) where.status = query.status;

    const { count, rows } = await TechnicianTask.findAndCountAll({
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
                        attributes: ["id", "title", "address", "city", "property_type"],
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
                    {
                        model: MaintenanceRequestMedia,
                        as: "media",
                        attributes: ["id", "media_url", "media_type"],
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
            },
        ],
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const updateTechnicianTaskStatusService = async (taskId, technicianId, userId, data) => {
    const { status: targetStatus, remarks } = data;

    const task = await TechnicianTask.findOne({
        where: { id: taskId, technician_id: technicianId },
        include: [{ model: MaintenanceRequest, as: "maintenanceRequest" }],
    });

    if (!task) {
        throw new ExpressError(404, "Task not found or not assigned to you");
    }

    if (task.status === "completed") {
        throw new ExpressError(400, "Completed tasks cannot be modified");
    }

    if (targetStatus === "in_progress") {
        if (!["assigned", "accepted"].includes(task.status)) {
            throw new ExpressError(
                400,
                `Cannot transition to "in_progress" from "${task.status}". Task must be assigned or accepted.`
            );
        }
    } else if (targetStatus === "completed") {
        if (!["in_progress", "accepted"].includes(task.status)) {
            throw new ExpressError(
                400,
                `Cannot complete a task that has not been started. Current status: "${task.status}".`
            );
        }
    } else if (targetStatus === "accepted" || targetStatus === "rejected") {
        if (task.status !== "assigned") {
            throw new ExpressError(
                400,
                `Cannot ${targetStatus} a task that is already "${task.status}".`
            );
        }
    }

    const t = await sequelize.transaction();

    try {
        const oldStatus = task.status;
        task.status = targetStatus;

        if (targetStatus === "in_progress" && !task.started_at) {
            task.started_at = new Date();
        }
        if (targetStatus === "completed") {
            task.completed_at = new Date();
        }
        await task.save({ transaction: t });

        if (task.maintenanceRequest) {
            if (targetStatus === "completed") {
                task.maintenanceRequest.status = "completed";
            } else if (targetStatus === "in_progress") {
                task.maintenanceRequest.status = "in_progress";
            } else if (targetStatus === "rejected") {
                task.maintenanceRequest.status = "pending";
            }
            await task.maintenanceRequest.save({ transaction: t });
        }

        await TechnicianTaskHistory.create(
            {
                technician_task_id: task.id,
                changed_by: userId,
                old_status: oldStatus,
                new_status: targetStatus,
                remarks: remarks || null,
            },
            { transaction: t }
        );

        await t.commit();

        return await TechnicianTask.findByPk(task.id, {
            include: [
                {
                    model: MaintenanceRequest,
                    as: "maintenanceRequest",
                },
                {
                    model: TechnicianTaskHistory,
                    as: "statusHistory",
                },
            ],
        });
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const uploadTechnicianTaskMediaService = async (taskId, technicianId, userId, stage, files = []) => {
    const task = await TechnicianTask.findOne({
        where: { id: taskId, technician_id: technicianId },
    });

    if (!task) {
        throw new ExpressError(404, "Task not found or not assigned to you");
    }

    if (!files || files.length === 0) {
        throw new ExpressError(400, "At least one media file is required");
    }

    const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file, "maintenance/technician_tasks");
        const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
        return await TechnicianTaskMedia.create({
            technician_task_id: taskId,
            uploaded_by: userId,
            media_url: result.url,
            media_type: mediaType,
            stage,
        });
    });

    return await Promise.all(uploadPromises);
};

const getTechnicianTaskMediaService = async (taskId, query = {}) => {
    const where = { technician_task_id: taskId };
    if (query.stage) where.stage = query.stage;

    return await TechnicianTaskMedia.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: User,
                as: "uploadedBy",
                attributes: ["id", "fullName"],
            },
        ],
    });
};

const getTechnicianTaskHistoryService = async (taskId) => {
    return await TechnicianTaskHistory.findAll({
        where: { technician_task_id: taskId },
        order: [["createdAt", "ASC"]],
        include: [
            {
                model: User,
                as: "changedBy",
                attributes: ["id", "fullName", "email"],
            },
        ],
    });
};

module.exports = {
    getMaintenanceCategoriesService,
    createMaintenanceRequestService,
    getOwnerMaintenanceRequestsService,
    getMaintenanceRequestByIdService,
    cancelMaintenanceRequestService,
    getCompanyMaintenanceRequestsService,
    getCompanyTechniciansService,
    assignTechnicianTaskService,
    getCompanyTechnicianTasksService,
    getTechnicianTaskByIdService,
    reassignTechnicianTaskService,
    getTechnicianMyTasksService,
    updateTechnicianTaskStatusService,
    uploadTechnicianTaskMediaService,
    getTechnicianTaskMediaService,
    getTechnicianTaskHistoryService,
};


const { sequelize } = require("../models");
const maintenanceCategoryRepository = require("../repositories/maintenance_category_repository");
const maintenanceRequestRepository = require("../repositories/maintenance_request_repository");
const maintenanceRequestMediaRepository = require("../repositories/maintenance_request_media_repository");
const technicianTaskRepository = require("../repositories/technician_task_repository");
const technicianTaskMediaRepository = require("../repositories/technician_task_media_repository");
const technicianTaskHistoryRepository = require("../repositories/technician_task_history_repository");
const propertyRepository = require("../repositories/property_repository");
const propertyOwnershipRepository = require("../repositories/property_ownership_repository");
const propertyFacilityAssignmentRepository = require("../repositories/property_facility_assignment_repository");
const technicianRepository = require("../repositories/technician_repository");
const authRepository = require("../repositories/auth_repository");
const ExpressError = require("../utils/express_error");
const uploadToCloudinary = require("../utils/upload_to_cloudinary");

class MaintenanceService {
    async getMaintenanceCategories() {
        return await maintenanceCategoryRepository.findActiveCategories();
    }

    async createMaintenanceRequest(userId, data, files = []) {
        const { property_id, category_id, title, description, priority = "medium" } = data;

        const property = await propertyRepository.findById(property_id);
        if (!property) {
            throw new ExpressError(404, "Property not found");
        }

        const category = await maintenanceCategoryRepository.findById(category_id);
        if (!category || category.status !== "active") {
            throw new ExpressError(404, "Active maintenance category not found");
        }

        const activeOwnership = await propertyOwnershipRepository.findActiveOwnership(property_id);

        if (!activeOwnership || activeOwnership.owner_id !== userId) {
            throw new ExpressError(
                403,
                "Only the current property owner can create maintenance requests"
            );
        }

        const activeAssignment = await propertyFacilityAssignmentRepository.findActiveAssignment(property_id);

        if (!activeAssignment) {
            throw new ExpressError(
                400,
                "Property does not have an active facility management company assignment. Please assign a company before requesting maintenance."
            );
        }

        let uploadedMedia = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const result = await uploadToCloudinary(file, "maintenance/requests");
                const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
                return {
                    media_url: result.url,
                    media_type: mediaType,
                };
            });
            uploadedMedia = await Promise.all(uploadPromises);
        }

        const t = await sequelize.transaction();

        try {
            const request = await maintenanceRequestRepository.create(
                {
                    property_id,
                    ownership_id: activeOwnership.id,
                    facility_assignment_id: activeAssignment.id,
                    category_id,
                    requested_by: userId,
                    title,
                    description,
                    priority,
                    status: "pending",
                },
                { transaction: t }
            );

            if (uploadedMedia.length > 0) {
                const mediaRecords = uploadedMedia.map((m) => ({
                    maintenance_request_id: request.id,
                    media_url: m.media_url,
                    media_type: m.media_type,
                }));
                await maintenanceRequestMediaRepository.bulkCreate(mediaRecords, { transaction: t });
            }

            await t.commit();

            return await maintenanceRequestRepository.findRequestWithFullDetails(request.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getOwnerMaintenanceRequests(userId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const where = { requested_by: userId };
        if (query.status) where.status = query.status;
        if (query.priority) where.priority = query.priority;
        if (query.property_id) where.property_id = parseInt(query.property_id, 10);
        if (query.category_id) where.category_id = parseInt(query.category_id, 10);

        const { count, rows } = await maintenanceRequestRepository.findOwnerRequests(where, {
            limit,
            offset,
        });

        return {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }

    async getMaintenanceRequestById(requestId, authUser = null, facility = null) {
        const request = await maintenanceRequestRepository.findRequestWithFullDetails(requestId);

        if (!request) {
            throw new ExpressError(404, "Maintenance request not found");
        }

        let isAuthorized = false;

        if (authUser) {
            if (request.requested_by === authUser.id) {
                isAuthorized = true;
            }
            if (authUser.role === 1 || authUser.role_id === 1) {
                isAuthorized = true;
            }
            if (
                request.technicianTask &&
                request.technicianTask.technician &&
                request.technicianTask.technician.user_id === authUser.id
            ) {
                isAuthorized = true;
            }
        }

        if (facility) {
            if (
                request.facilityAssignment &&
                request.facilityAssignment.company_id === facility.id
            ) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new ExpressError(
                403,
                "You are not authorized to view this maintenance request"
            );
        }

        return request;
    }

    async cancelMaintenanceRequest(requestId, userId) {
        const request = await maintenanceRequestRepository.findById(requestId);

        if (!request) {
            throw new ExpressError(404, "Maintenance request not found");
        }

        if (request.requested_by !== userId) {
            throw new ExpressError(
                403,
                "You are not authorized to cancel this maintenance request"
            );
        }

        if (request.status !== "pending") {
            throw new ExpressError(
                400,
                `Cannot cancel request. Only pending requests can be cancelled. Current status is ${request.status}.`
            );
        }

        request.status = "cancelled";
        await request.save();

        return request;
    }

    async getCompanyMaintenanceRequests(facilityId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const assignments = await propertyFacilityAssignmentRepository.findAll({
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

        const { count, rows } = await maintenanceRequestRepository.findCompanyRequests(where, {
            limit,
            offset,
        });

        return {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }

    async getCompanyTechnicians(facilityId) {
        return await technicianRepository.findAll({
            where: { company_id: facilityId },
            include: [
                {
                    model: authRepository.model,
                    as: "user",
                    attributes: ["id", "fullName", "email", "phone"],
                },
            ],
            order: [["id", "ASC"]],
        });
    }

    async assignTechnicianTask(facilityId, data) {
        const { maintenance_request_id, technician_id, instructions, scheduled_at } = data;

        const request = await maintenanceRequestRepository.findById(maintenance_request_id, {
            include: [
                {
                    model: propertyFacilityAssignmentRepository.model,
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

        const technician = await technicianRepository.findOne(
            { id: technician_id, company_id: facilityId },
            {
                include: [{ model: authRepository.model, as: "user" }],
            }
        );

        if (!technician) {
            throw new ExpressError(
                404,
                "Technician not found in your facility company"
            );
        }

        if (technician.status !== "active") {
            throw new ExpressError(400, "Technician account is not active");
        }

        const existingTask = await technicianTaskRepository.findActiveTaskByRequestId(maintenance_request_id);

        if (existingTask) {
            throw new ExpressError(
                409,
                "A technician task has already been assigned for this maintenance request. Use the reassign endpoint to change the technician."
            );
        }

        const t = await sequelize.transaction();

        try {
            const task = await technicianTaskRepository.create(
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

            await technicianTaskHistoryRepository.create(
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

            return await technicianTaskRepository.findTaskWithAllDetails(task.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getCompanyTechnicianTasks(facilityId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const where = { assigned_by: facilityId };
        if (query.status) where.status = query.status;
        if (query.technician_id) where.technician_id = parseInt(query.technician_id, 10);

        const { count, rows } = await technicianTaskRepository.findCompanyTasks(where, {
            limit,
            offset,
        });

        return {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }

    async getTechnicianTaskById(taskId, authUser = null, facility = null, technician = null) {
        const task = await technicianTaskRepository.findTaskWithAllDetails(taskId);

        if (!task) {
            throw new ExpressError(404, "Technician task not found");
        }

        let isAuthorized = false;

        if (facility && task.assigned_by === facility.id) {
            isAuthorized = true;
        }

        if (technician && task.technician_id === technician.id) {
            isAuthorized = true;
        }

        if (
            authUser &&
            task.technician &&
            task.technician.user_id === authUser.id
        ) {
            isAuthorized = true;
        }

        if (
            authUser &&
            task.maintenanceRequest &&
            task.maintenanceRequest.requested_by === authUser.id
        ) {
            isAuthorized = true;
        }

        if (authUser && (authUser.role === 1 || authUser.role_id === 1)) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            throw new ExpressError(
                403,
                "You are not authorized to view this technician task"
            );
        }

        return task;
    }

    async reassignTechnicianTask(taskId, facilityId, data) {
        const { technician_id, instructions, scheduled_at } = data;

        const task = await technicianTaskRepository.findById(taskId, {
            include: [
                {
                    model: technicianRepository.model,
                    as: "technician",
                },
                {
                    model: maintenanceRequestRepository.model,
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

        const newTech = await technicianRepository.findOne(
            { id: technician_id, company_id: facilityId },
            {
                include: [{ model: authRepository.model, as: "user" }],
            }
        );

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

            await technicianTaskHistoryRepository.create(
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

            return await technicianTaskRepository.findTaskWithAllDetails(task.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getTechnicianMyTasks(technicianId, query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const where = { technician_id: technicianId };
        if (query.status) where.status = query.status;

        const { count, rows } = await technicianTaskRepository.findTechnicianTasks(where, {
            limit,
            offset,
        });

        return {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }

    async updateTechnicianTaskStatus(taskId, technicianId, userId, data) {
        const { status: targetStatus, remarks } = data;

        const task = await technicianTaskRepository.findOne(
            { id: taskId, technician_id: technicianId },
            {
                include: [{ model: maintenanceRequestRepository.model, as: "maintenanceRequest" }],
            }
        );

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

            await technicianTaskHistoryRepository.create(
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

            return await technicianTaskRepository.findTaskWithAllDetails(task.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async uploadTechnicianTaskMedia(taskId, technicianId, userId, stage, files = []) {
        const task = await technicianTaskRepository.findOne({
            id: taskId,
            technician_id: technicianId,
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
            return await technicianTaskMediaRepository.create({
                technician_task_id: taskId,
                uploaded_by: userId,
                media_url: result.url,
                media_type: mediaType,
                stage,
            });
        });

        return await Promise.all(uploadPromises);
    }

    async getTechnicianTaskMedia(taskId, query = {}) {
        return await technicianTaskMediaRepository.findByTaskId(taskId, query.stage);
    }

    async getTechnicianTaskHistory(taskId) {
        return await technicianTaskHistoryRepository.findByTaskId(taskId);
    }
}

const maintenanceService = new MaintenanceService();

maintenanceService.getMaintenanceCategoriesService = maintenanceService.getMaintenanceCategories.bind(maintenanceService);
maintenanceService.createMaintenanceRequestService = maintenanceService.createMaintenanceRequest.bind(maintenanceService);
maintenanceService.getOwnerMaintenanceRequestsService = maintenanceService.getOwnerMaintenanceRequests.bind(maintenanceService);
maintenanceService.getMaintenanceRequestByIdService = maintenanceService.getMaintenanceRequestById.bind(maintenanceService);
maintenanceService.cancelMaintenanceRequestService = maintenanceService.cancelMaintenanceRequest.bind(maintenanceService);
maintenanceService.getCompanyMaintenanceRequestsService = maintenanceService.getCompanyMaintenanceRequests.bind(maintenanceService);
maintenanceService.getCompanyTechniciansService = maintenanceService.getCompanyTechnicians.bind(maintenanceService);
maintenanceService.assignTechnicianTaskService = maintenanceService.assignTechnicianTask.bind(maintenanceService);
maintenanceService.getCompanyTechnicianTasksService = maintenanceService.getCompanyTechnicianTasks.bind(maintenanceService);
maintenanceService.getTechnicianTaskByIdService = maintenanceService.getTechnicianTaskById.bind(maintenanceService);
maintenanceService.reassignTechnicianTaskService = maintenanceService.reassignTechnicianTask.bind(maintenanceService);
maintenanceService.getTechnicianMyTasksService = maintenanceService.getTechnicianMyTasks.bind(maintenanceService);
maintenanceService.updateTechnicianTaskStatusService = maintenanceService.updateTechnicianTaskStatus.bind(maintenanceService);
maintenanceService.uploadTechnicianTaskMediaService = maintenanceService.uploadTechnicianTaskMedia.bind(maintenanceService);
maintenanceService.getTechnicianTaskMediaService = maintenanceService.getTechnicianTaskMedia.bind(maintenanceService);
maintenanceService.getTechnicianTaskHistoryService = maintenanceService.getTechnicianTaskHistory.bind(maintenanceService);

module.exports = maintenanceService;

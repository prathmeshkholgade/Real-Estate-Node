const maintenanceService = require("../services/maintenance_service");

const getMaintenanceCategories = async (req, res) => {
    const categories = await maintenanceService.getMaintenanceCategories();

    return res.status(200).json({
        success: true,
        message: "Maintenance categories retrieved successfully",
        data: categories,
    });
};

const createMaintenanceRequest = async (req, res) => {
    let files = [];
    if (req.files) {
        if (Array.isArray(req.files)) {
            files = req.files;
        } else {
            Object.values(req.files).forEach((fileArr) => {
                files = files.concat(fileArr);
            });
        }
    } else if (req.file) {
        files = [req.file];
    }

    const request = await maintenanceService.createMaintenanceRequest(
        req.user.id,
        req.body,
        files
    );

    return res.status(201).json({
        success: true,
        message: "Maintenance request created successfully",
        data: request,
    });
};

const getOwnerMaintenanceRequests = async (req, res) => {
    const result = await maintenanceService.getOwnerMaintenanceRequests(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Your maintenance requests retrieved successfully",
        data: result,
    });
};

const getMaintenanceRequestById = async (req, res) => {
    const request = await maintenanceService.getMaintenanceRequestById(
        req.params.id,
        req.user,
        req.facility
    );

    return res.status(200).json({
        success: true,
        message: "Maintenance request details retrieved successfully",
        data: request,
    });
};

const cancelMaintenanceRequest = async (req, res) => {
    const cancelled = await maintenanceService.cancelMaintenanceRequest(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Maintenance request cancelled successfully",
        data: cancelled,
    });
};

const getCompanyMaintenanceRequests = async (req, res) => {
    const result = await maintenanceService.getCompanyMaintenanceRequests(
        req.facility.id,
        req.query
    );

    return res.status(200).json({
        success: true,
        message: "Company maintenance requests retrieved successfully",
        data: result,
    });
};

const getCompanyTechnicians = async (req, res) => {
    const technicians = await maintenanceService.getCompanyTechnicians(req.facility.id);

    return res.status(200).json({
        success: true,
        message: "Company technicians retrieved successfully",
        data: technicians,
    });
};

const assignTechnicianTask = async (req, res) => {
    const task = await maintenanceService.assignTechnicianTask(req.facility.id, req.body);

    return res.status(201).json({
        success: true,
        message: "Maintenance request assigned to technician successfully",
        data: task,
    });
};

const getCompanyTechnicianTasks = async (req, res) => {
    const result = await maintenanceService.getCompanyTechnicianTasks(
        req.facility.id,
        req.query
    );

    return res.status(200).json({
        success: true,
        message: "Company technician tasks retrieved successfully",
        data: result,
    });
};

const getTechnicianTaskById = async (req, res) => {
    const task = await maintenanceService.getTechnicianTaskById(
        req.params.id,
        req.user,
        req.facility,
        req.technician
    );

    return res.status(200).json({
        success: true,
        message: "Technician task details retrieved successfully",
        data: task,
    });
};

const reassignTechnicianTask = async (req, res) => {
    const updated = await maintenanceService.reassignTechnicianTask(
        req.params.id,
        req.facility.id,
        req.body
    );

    return res.status(200).json({
        success: true,
        message: "Technician task reassigned successfully",
        data: updated,
    });
};

const getTechnicianMyTasks = async (req, res) => {
    const result = await maintenanceService.getTechnicianMyTasks(
        req.technician.id,
        req.query
    );

    return res.status(200).json({
        success: true,
        message: "Your assigned tasks retrieved successfully",
        data: result,
    });
};

const updateTechnicianTaskStatus = async (req, res) => {
    const updated = await maintenanceService.updateTechnicianTaskStatus(
        req.params.id,
        req.technician.id,
        req.user.id,
        req.body
    );

    return res.status(200).json({
        success: true,
        message: `Task status updated to ${req.body.status} successfully`,
        data: updated,
    });
};

const uploadTechnicianTaskMedia = async (req, res) => {
    let files = [];
    if (req.files) {
        if (Array.isArray(req.files)) {
            files = req.files;
        } else {
            Object.values(req.files).forEach((fileArr) => {
                files = files.concat(fileArr);
            });
        }
    } else if (req.file) {
        files = [req.file];
    }

    const uploaded = await maintenanceService.uploadTechnicianTaskMedia(
        req.params.id,
        req.technician.id,
        req.user.id,
        req.body.stage,
        files
    );

    return res.status(201).json({
        success: true,
        message: "Technician task media uploaded successfully",
        data: uploaded,
    });
};

const getTechnicianTaskMedia = async (req, res) => {
    const media = await maintenanceService.getTechnicianTaskMedia(req.params.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Technician task media retrieved successfully",
        data: media,
    });
};

const getTechnicianTaskHistory = async (req, res) => {
    const history = await maintenanceService.getTechnicianTaskHistory(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Technician task status history retrieved successfully",
        data: history,
    });
};

module.exports = {
    getMaintenanceCategories,
    createMaintenanceRequest,
    getOwnerMaintenanceRequests,
    getMaintenanceRequestById,
    cancelMaintenanceRequest,
    getCompanyMaintenanceRequests,
    getCompanyTechnicians,
    assignTechnicianTask,
    getCompanyTechnicianTasks,
    getTechnicianTaskById,
    reassignTechnicianTask,
    getTechnicianMyTasks,
    updateTechnicianTaskStatus,
    uploadTechnicianTaskMedia,
    getTechnicianTaskMedia,
    getTechnicianTaskHistory,
};

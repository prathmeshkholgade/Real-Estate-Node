const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const {
    verifyUser,
    verifyFacility,
    verifyTechnician,
} = require("../middleware/middleware");
const {
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
} = require("../controller/maintenance_controller");
const {
    createMaintenanceRequestSchema,
    assignTechnicianTaskSchema,
    reassignTechnicianTaskSchema,
    updateTaskStatusSchema,
    uploadTaskMediaSchema,
    maintenanceIdParamSchema,
} = require("../utils/validation");

router.get("/categories", asyncWrap(getMaintenanceCategories));

router.post(
    "/requests",
    verifyUser,
    upload.any(),
    validate(createMaintenanceRequestSchema, "body"),
    asyncWrap(createMaintenanceRequest)
);

router.get(
    "/requests/my-requests",
    verifyUser,
    asyncWrap(getOwnerMaintenanceRequests)
);

router.get(
    "/requests/:id",
    verifyUser,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(getMaintenanceRequestById)
);

router.patch(
    "/requests/:id/cancel",
    verifyUser,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(cancelMaintenanceRequest)
);

router.get(
    "/company/requests",
    verifyFacility,
    asyncWrap(getCompanyMaintenanceRequests)
);

router.get(
    "/company/requests/:id",
    verifyFacility,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(getMaintenanceRequestById)
);

router.get(
    "/company/technicians",
    verifyFacility,
    asyncWrap(getCompanyTechnicians)
);

router.post(
    "/technician-tasks",
    verifyFacility,
    validate(assignTechnicianTaskSchema, "body"),
    asyncWrap(assignTechnicianTask)
);

router.get(
    "/company/technician-tasks",
    verifyFacility,
    asyncWrap(getCompanyTechnicianTasks)
);

router.patch(
    "/technician-tasks/:id/reassign",
    verifyFacility,
    validate(maintenanceIdParamSchema, "params"),
    validate(reassignTechnicianTaskSchema, "body"),
    asyncWrap(reassignTechnicianTask)
);

router.get(
    "/technician-tasks/my-tasks",
    verifyUser,
    verifyTechnician,
    asyncWrap(getTechnicianMyTasks)
);

router.get(
    "/technician-tasks/:id",
    verifyUser,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(getTechnicianTaskById)
);

router.patch(
    "/technician-tasks/:id/status",
    verifyUser,
    verifyTechnician,
    validate(maintenanceIdParamSchema, "params"),
    validate(updateTaskStatusSchema, "body"),
    asyncWrap(updateTechnicianTaskStatus)
);

router.post(
    "/technician-tasks/:id/media",
    verifyUser,
    verifyTechnician,
    upload.any(),
    validate(maintenanceIdParamSchema, "params"),
    validate(uploadTaskMediaSchema, "body"),
    asyncWrap(uploadTechnicianTaskMedia)
);

router.get(
    "/technician-tasks/:id/media",
    verifyUser,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(getTechnicianTaskMedia)
);

router.get(
    "/technician-tasks/:id/history",
    verifyUser,
    validate(maintenanceIdParamSchema, "params"),
    asyncWrap(getTechnicianTaskHistory)
);

module.exports = router;


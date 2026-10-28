const express = require("express");
const { verifyUser } = require("../middleware/middleware");
const validate = require("../middleware/validate");
const { asyncWrap } = require("../utils/async_wrap");
const {
    createPropertyBasicInfo,
    updatePropertyBasicInfo,
} = require("../controller/property_controller");
const {
    propertyIdParamSchema,
    createPropertyBasicInfoSchema,
    updatePropertyBasicInfoSchema,
} = require("../utils/validation");

const router = express.Router();

router.post(
    "/",
    verifyUser,
    validate(createPropertyBasicInfoSchema, "body"),
    asyncWrap(createPropertyBasicInfo)
);

router.patch(
    "/:id",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(updatePropertyBasicInfoSchema, "body"),
    asyncWrap(updatePropertyBasicInfo)
);

// Planned Multi-step Wizard Routes:
// router.patch("/:id/details", verifyUser, validate(propertyIdParamSchema, "params"), validate(propertyDetailSchema, "body"), asyncWrap(upsertPropertyDetails));
// router.patch("/:id/configuration", verifyUser, validate(propertyIdParamSchema, "params"), validate(propertyConfigurationSchema, "body"), asyncWrap(upsertPropertyConfiguration));
// router.post("/:id/media", verifyUser, validate(propertyIdParamSchema, "params"), validate(propertyMediaSchema, "body"), asyncWrap(addPropertyMedia));
// router.post("/:id/documents", verifyUser, validate(propertyIdParamSchema, "params"), validate(propertyDocumentSchema, "body"), asyncWrap(addPropertyDocument));
// router.post("/:id/submit", verifyUser, validate(propertyIdParamSchema, "params"), validate(submitPropertySchema, "body"), asyncWrap(submitProperty));

module.exports = router;

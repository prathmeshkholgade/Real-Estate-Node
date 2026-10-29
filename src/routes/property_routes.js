const express = require("express");
const { verifyUser } = require("../middleware/middleware");
const validate = require("../middleware/validate");
const { asyncWrap } = require("../utils/async_wrap");
const {
    getPropertyById,
    createPropertyBasicInfo,
    updatePropertyBasicInfo,
    upsertPropertyDetails,
    upsertPropertyConfiguration,
    addPropertyMedia,
    deletePropertyMedia,
    addPropertyDocuments,
    deletePropertyDocument,
    submitProperty,
} = require("../controller/property_controller");
const {
    propertyIdParamSchema,
    propertyMediaParamSchema,
    propertyDocumentParamSchema,
    createPropertyBasicInfoSchema,
    updatePropertyBasicInfoSchema,
    propertyDetailSchema,
    propertyConfigurationSchema,
    propertyMediaSchema,
    propertyDocumentSchema,
    submitPropertySchema,
} = require("../utils/validation");
const router = express.Router();


router.get(
    "/:id",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    asyncWrap(getPropertyById)
);


// step 1
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



router.patch(
    "/:id/details",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(propertyDetailSchema, "body"),
    asyncWrap(upsertPropertyDetails)
);



router.patch(
    "/:id/configuration",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(propertyConfigurationSchema, "body"),
    asyncWrap(upsertPropertyConfiguration)
);



router.post(
    "/:id/media",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(propertyMediaSchema, "body"),
    asyncWrap(addPropertyMedia)
);

router.delete(
    "/:id/media/:mediaId",
    verifyUser,
    validate(propertyMediaParamSchema, "params"),
    asyncWrap(deletePropertyMedia)
);



router.post(
    "/:id/documents",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(propertyDocumentSchema, "body"),
    asyncWrap(addPropertyDocuments)
);

router.delete(
    "/:id/documents/:docId",
    verifyUser,
    validate(propertyDocumentParamSchema, "params"),
    asyncWrap(deletePropertyDocument)
);



router.post(
    "/:id/submit",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(submitPropertySchema, "body"),
    asyncWrap(submitProperty)
);

module.exports = router;





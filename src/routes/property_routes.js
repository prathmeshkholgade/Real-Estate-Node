const express = require("express");
const { verifyUser } = require("../middleware/middleware");
const validate = require("../middleware/validate");
const { asyncWrap } = require("../utils/async_wrap");
const upload = require("../middleware/upload");
const {
    getPropertyById,
    createPropertyBasicInfo,
    updatePropertyBasicInfo,
    upsertPropertyDetails,
    upsertPropertyConfiguration,
    addPropertyMedia,
    addPropertyDocuments,
} = require("../controller/property_controller");
const {
    propertyIdParamSchema,
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
    upload.fields([
        { name: "images", maxCount: 8 },
        { name: "videos", maxCount: 2 },
    ]),
    asyncWrap(addPropertyMedia)
);


router.post(
    "/:id/documents",
    verifyUser,
    validate(propertyIdParamSchema, "params"),
    validate(propertyDocumentSchema, "body"),
    upload.fields([
        { name: "documents", maxCount: 5 },
    ]),
    asyncWrap(addPropertyDocuments)
);



module.exports = router;





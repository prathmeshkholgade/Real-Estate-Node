const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const {
    verifyUser,
    verifyPropertyOwner,
    verifyFacility,
} = require("../middleware/middleware");
const {
    facilityLogin,
    createFacilityCompany,
    getAllFacilities,
    getMyCreatedFacilities,
    getFacilityById,
    getFacilityProfile,
    updateFacilityProfile,
} = require("../controller/facility_company_controller");
const {
    facilityLoginSchema,
    createFacilityCompanySchema,
    updateFacilityCompanySchema,
    facilityIdParamSchema,
} = require("../utils/validation");

router.post(
    "/auth/login",
    validate(facilityLoginSchema, "body"),
    asyncWrap(facilityLogin)
);

router.get(
    "/profile/me",
    verifyFacility,
    asyncWrap(getFacilityProfile)
);

router.patch(
    "/profile/me",
    verifyFacility,
    validate(updateFacilityCompanySchema, "body"),
    asyncWrap(updateFacilityProfile)
);

router.post(
    "/",
    verifyUser,
    verifyPropertyOwner,
    validate(createFacilityCompanySchema, "body"),
    asyncWrap(createFacilityCompany)
);

router.get(
    "/my-created",
    verifyUser,
    verifyPropertyOwner,
    asyncWrap(getMyCreatedFacilities)
);

router.get(
    "/",
    verifyUser,
    asyncWrap(getAllFacilities)
);

router.get(
    "/:id",
    verifyUser,
    validate(facilityIdParamSchema, "params"),
    asyncWrap(getFacilityById)
);

module.exports = router;

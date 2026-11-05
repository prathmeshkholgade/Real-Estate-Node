const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const {
    verifyUser,
    verifyPropertyOwner,
    verifyFacility,
    verifyTechnician,
} = require("../middleware/middleware");
const {
    facilityLogin,
    createFacilityCompany,
    getAllFacilities,
    getMyCreatedFacilities,
    getFacilityById,
    getFacilityProfile,
    updateFacilityProfile,
    createTechnician,
    getFacilityTechnicians,
    updateTechnicianProfile,
} = require("../controller/facility_company_controller");
const {
    facilityLoginSchema,
    createFacilityCompanySchema,
    updateFacilityCompanySchema,
    facilityIdParamSchema,
    createTechnicianSchema,
} = require("../utils/validation");

router.post(
    "/auth/login",
    validate(facilityLoginSchema, "body"),
    asyncWrap(facilityLogin)
);

router.post(
    "/create-technicition",
    verifyFacility,
    validate(createTechnicianSchema, "body"),
    asyncWrap(createTechnician)
);

router.post(
    "/create-technician",
    verifyFacility,
    validate(createTechnicianSchema, "body"),
    asyncWrap(createTechnician)
);

router.get(
    "/technicians",
    verifyFacility,
    asyncWrap(getFacilityTechnicians)
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
router.patch("/technician/profile", verifyUser, verifyTechnician, upload.single("image"), asyncWrap(updateTechnicianProfile));

module.exports = router;

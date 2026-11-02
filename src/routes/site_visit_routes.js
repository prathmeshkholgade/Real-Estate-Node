const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const {
    verifyUser,
    verifyBuyer,
    verifyPropertyOwner,
} = require("../middleware/middleware");
const {
    bookSiteVisit,
    getBuyerVisits,
    getSiteVisitById,
    cancelSiteVisit,
    getOwnerSiteVisits,
    updateSiteVisitStatus,
} = require("../controller/site_visit_controller");
const {
    bookSiteVisitSchema,
    updateSiteVisitStatusSchema,
    siteVisitIdParamSchema,
} = require("../utils/validation");

router.post(
    "/",
    verifyUser,
    verifyBuyer,
    validate(bookSiteVisitSchema, "body"),
    asyncWrap(bookSiteVisit)
);

router.get(
    "/my-visits",
    verifyUser,
    verifyBuyer,
    asyncWrap(getBuyerVisits)
);

router.get(
    "/owner",
    verifyUser,
    verifyPropertyOwner,
    asyncWrap(getOwnerSiteVisits)
);

router.get(
    "/:id",
    verifyUser,
    validate(siteVisitIdParamSchema, "params"),
    asyncWrap(getSiteVisitById)
);

router.patch(
    "/:id/cancel",
    verifyUser,
    validate(siteVisitIdParamSchema, "params"),
    asyncWrap(cancelSiteVisit)
);

router.patch(
    "/:id/status",
    verifyUser,
    verifyPropertyOwner,
    validate(siteVisitIdParamSchema, "params"),
    validate(updateSiteVisitStatusSchema, "body"),
    asyncWrap(updateSiteVisitStatus)
);

module.exports = router;


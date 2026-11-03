const express = require("express");
const router = express.Router();
const authRoutes = require("./auth_routes.js");
const propertyRoutes = require("./property_routes.js");
const facilityCompanyRoutes = require("./facility_company_routes.js");
const siteVisitRoutes = require("./site_visit_routes.js");
const purchaseRequestRoutes = require("./purchase_request_routes.js");
const paymentRoutes = require("./payment_routes.js");
const { getOwnerSiteVisits } = require("../controller/site_visit_controller.js");
const {
    getOwnerPurchaseRequests,
    getPropertyOwnership,
} = require("../controller/purchase_request_controller.js");
const { verifyUser, verifyPropertyOwner } = require("../middleware/middleware.js");
const validate = require("../middleware/validate.js");
const { propertyIdParamSchema } = require("../utils/validation.js");
const { asyncWrap } = require("../utils/async_wrap.js");

router.use("/auth", authRoutes);
router.use("/property", propertyRoutes);
router.use("/properties", propertyRoutes);
router.use("/facility", facilityCompanyRoutes);

router.use("/site-visits", siteVisitRoutes);
router.get("/owner/site-visits", verifyUser, verifyPropertyOwner, asyncWrap(getOwnerSiteVisits));

router.use("/purchase-requests", purchaseRequestRoutes);
router.get("/owner/purchase-requests", verifyUser, verifyPropertyOwner, asyncWrap(getOwnerPurchaseRequests));

router.use("/payments", paymentRoutes);

router.get("/properties/:id/ownership", verifyUser, validate(propertyIdParamSchema, "params"), asyncWrap(getPropertyOwnership));
router.get("/property/:id/ownership", verifyUser, validate(propertyIdParamSchema, "params"), asyncWrap(getPropertyOwnership));

module.exports = router;

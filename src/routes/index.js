const express = require("express");
const router = express.Router();
const authRoutes = require("./auth_routes.js");
const propertyRoutes = require("./property_routes.js");
const facilityCompanyRoutes = require("./facility_company_routes.js");
const siteVisitRoutes = require("./site_visit_routes.js");
const { getOwnerSiteVisits } = require("../controller/site_visit_controller.js");
const { verifyUser, verifyPropertyOwner } = require("../middleware/middleware.js");
const { asyncWrap } = require("../utils/async_wrap.js");

router.use("/auth", authRoutes);
router.use("/property", propertyRoutes);
router.use("/facility", facilityCompanyRoutes);

router.use("/api/site-visits", siteVisitRoutes);
router.use("/site-visits", siteVisitRoutes);
router.get("/api/owner/site-visits", verifyUser, verifyPropertyOwner, asyncWrap(getOwnerSiteVisits));
router.get("/owner/site-visits", verifyUser, verifyPropertyOwner, asyncWrap(getOwnerSiteVisits));

module.exports = router;

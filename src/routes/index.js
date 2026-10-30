const express = require("express");
const router = express.Router();
const authRoutes = require("./auth_routes.js");
const propertyRoutes = require("./property_routes.js");
const facilityCompanyRoutes = require("./facility_company_routes.js");

router.use("/auth", authRoutes);
router.use("/property", propertyRoutes);
router.use("/facility", facilityCompanyRoutes);

module.exports = router;

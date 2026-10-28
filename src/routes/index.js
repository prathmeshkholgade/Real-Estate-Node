const express = require("express");
const router = express.Router();
const authRoutes = require("./auth_routes.js");
const propertyRoutes = require("./property_routes.js");


router.use("/auth", authRoutes);
router.use("/property", propertyRoutes);


module.exports = router;

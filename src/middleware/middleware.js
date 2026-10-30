const jwt = require("jsonwebtoken");
const { User, Roles, FacilityManagementCompany } = require("../models");

const verifyUser = (req, res, next) => {
    try {
        let token = req.cookies?.token || req.headers.authorization;

        if (token && token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const verifyPropertyOwner = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Authentication required",
            });
        }

        const user = await User.findByPk(req.user.id, {
            include: [{ model: Roles, as: "role" }],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const allowedRoleIds = [2, 3, 6];
        const allowedRoleNames = ["agent", "developer", "property owner"];
        const roleName = user.role?.role_name?.toLowerCase();

        if (!allowedRoleIds.includes(user.role_id) && !allowedRoleNames.includes(roleName)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Only Agents, Developers, or Property Owners can perform this action",
            });
        }

        req.currentUser = user;
        next();
    } catch (error) {
        next(error);
    }
};

const verifyFacility = async (req, res, next) => {
    try {
        let token = req.cookies?.token || req.headers.authorization;

        if (token && token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const facilityId = decoded.id || decoded.company_id;

        const facility = await FacilityManagementCompany.findByPk(facilityId);

        if (!facility) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Facility management company not found",
            });
        }

        if (facility.status === "inactive" || facility.status === "suspended") {
            return res.status(403).json({
                success: false,
                message: `Account is ${facility.status}. Please contact administrator.`,
            });
        }

        req.facility = facility;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyUser,
    verifyPropertyOwner,
    verifyFacility,
};

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const {
    FacilityManagementCompany,
    PropertyFacilityAssignment,
    Property,
    User,
} = require("../models");
const { generateFacilityToken } = require("../utils/helper");
const ExpressError = require("../utils/express_error");

const facilityLoginService = async (email, password) => {
    const company = await FacilityManagementCompany.findOne({
        where: { email },
    });

    if (!company) {
        throw new ExpressError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
        throw new ExpressError(401, "Invalid email or password");
    }

    if (company.status === "inactive" || company.status === "suspended") {
        throw new ExpressError(
            403,
            `Company account is currently ${company.status}. Please contact administrator.`
        );
    }

    const token = generateFacilityToken(company);

    const safeCompany = company.toJSON();
    delete safeCompany.password;

    return {
        company: safeCompany,
        token,
    };
};

const createFacilityCompanyByOwnerService = async (data, ownerId) => {
    const { company_name, email, phone, address, password, status = "active" } = data;

    const existingCompany = await FacilityManagementCompany.findOne({
        where: { email },
    });

    if (existingCompany) {
        throw new ExpressError(409, "Facility company already exists with this email");
    }

    const plainPassword =
        password && password.trim().length >= 6
            ? password.trim()
            : `Fac@${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const company = await FacilityManagementCompany.create({
        company_name,
        email,
        phone,
        address,
        password: hashedPassword,
        status,
        created_by: ownerId,
    });

    const safeCompany = company.toJSON();
    delete safeCompany.password;

    return {
        company: safeCompany,
        credentials: {
            email: company.email,
            password: plainPassword,
            // login_url: "/facility/auth/login",
        },
    };
};

const getAllFacilitiesService = async (query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const where = {};
    if (query.status) {
        where.status = query.status;
    }

    if (query.search) {
        where[Op.or] = [
            { company_name: { [Op.like]: `%${query.search}%` } },
            { email: { [Op.like]: `%${query.search}%` } },
            { address: { [Op.like]: `%${query.search}%` } },
        ];
    }

    const result = await FacilityManagementCompany.findAndCountAll({
        where,
        attributes: [
            "id",
            "company_name",
            "email",
            "phone",
            "address",
            "status",
            "created_by",
            "createdAt",
        ],
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["id", "fullName", "email"],
            },
        ],
        limit,
        offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
    });

    return {
        facilities: result.rows,
        pagination: {
            totalRecords: result.count,
            currentPage: page,
            limit,
            totalPages: Math.ceil(result.count / limit),
        },
    };
};

const getMyCreatedFacilitiesService = async (ownerId, query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const result = await FacilityManagementCompany.findAndCountAll({
        where: { created_by: ownerId },
        attributes: [
            "id",
            "company_name",
            "email",
            "phone",
            "address",
            "status",
            "created_by",
            "createdAt",
        ],
        include: [
            {
                model: PropertyFacilityAssignment,
                as: "propertyAssignments",
                attributes: ["id", "property_id", "status"],
            },
        ],
        limit,
        offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
    });

    return {
        facilities: result.rows,
        pagination: {
            totalRecords: result.count,
            currentPage: page,
            limit,
            totalPages: Math.ceil(result.count / limit),
        },
    };
};

const getFacilityByIdService = async (facilityId) => {
    const company = await FacilityManagementCompany.findByPk(facilityId, {
        attributes: [
            "id",
            "company_name",
            "email",
            "phone",
            "address",
            "status",
            "created_by",
            "createdAt",
        ],
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["id", "fullName", "email"],
            },
            {
                model: PropertyFacilityAssignment,
                as: "propertyAssignments",
                include: [
                    {
                        model: Property,
                        as: "property",
                        attributes: ["id", "title", "address", "city", "property_type"],
                    },
                ],
            },
        ],
    });

    if (!company) {
        throw new ExpressError(404, "Facility management company not found");
    }

    return company;
};

const getFacilityProfileService = async (facilityId) => {
    const company = await FacilityManagementCompany.findByPk(facilityId, {
        attributes: [
            "id",
            "company_name",
            "email",
            "phone",
            "address",
            "status",
            "created_by",
            "createdAt",
        ],
        include: [
            {
                model: PropertyFacilityAssignment,
                as: "propertyAssignments",
                include: [
                    {
                        model: Property,
                        as: "property",
                        attributes: ["id", "title", "address", "city", "property_type", "price"],
                    },
                    {
                        model: User,
                        as: "assignedBy",
                        attributes: ["id", "fullName", "email", "phone"],
                    },
                ],
            },
        ],
    });

    if (!company) {
        throw new ExpressError(404, "Facility management company not found");
    }

    return company;
};

const updateFacilityProfileService = async (facilityId, updateData) => {
    const company = await FacilityManagementCompany.findByPk(facilityId);

    if (!company) {
        throw new ExpressError(404, "Facility management company not found");
    }

    const { company_name, phone, address } = updateData;

    await company.update({
        ...(company_name && { company_name }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
    });

    const safeCompany = company.toJSON();
    delete safeCompany.password;

    return safeCompany;
};

module.exports = {
    facilityLoginService,
    createFacilityCompanyByOwnerService,
    getAllFacilitiesService,
    getMyCreatedFacilitiesService,
    getFacilityByIdService,
    getFacilityProfileService,
    updateFacilityProfileService,
};

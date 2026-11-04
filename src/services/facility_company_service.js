const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const {
    FacilityManagementCompany,
    PropertyFacilityAssignment,
    Property,
    User,
    Technician,
    sequelize,
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

const createTechnicianByFacilityService = async (facilityId, data) => {
    const {
        fullName,
        email,
        phone,
        password,
        specialization,
        experience_years,
        qualification,
        status = "active",
    } = data;

    const company = await FacilityManagementCompany.findByPk(facilityId);
    if (!company) {
        throw new ExpressError(404, "Facility management company not found");
    }

    if (company.status === "inactive" || company.status === "suspended") {
        throw new ExpressError(
            403,
            `Facility company account is ${company.status}. Please contact administrator.`
        );
    }

    const existingUserEmail = await User.findOne({ where: { email } });
    if (existingUserEmail) {
        throw new ExpressError(409, "User already exists with this email");
    }

    const existingUserPhone = await User.findOne({ where: { phone } });
    if (existingUserPhone) {
        throw new ExpressError(409, "User already exists with this phone number");
    }

    const plainPassword =
        password && password.trim().length >= 6
            ? password.trim()
            : `Tech@${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const t = await sequelize.transaction();

    try {
        const user = await User.create(
            {
                fullName,
                email,
                phone,
                password: hashedPassword,
                role_id: 5,
            },
            { transaction: t }
        );

        const technician = await Technician.create(
            {
                user_id: user.id,
                company_id: facilityId,
                specialization: specialization || null,
                experience_years: experience_years !== undefined ? experience_years : null,
                qualification: qualification || null,
                status: status || "active",
            },
            { transaction: t }
        );

        await t.commit();

        const createdTechnician = await Technician.findByPk(technician.id, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullName", "email", "phone", "role_id"],
                },
                {
                    model: FacilityManagementCompany,
                    as: "company",
                    attributes: ["id", "company_name", "email", "phone"],
                },
            ],
        });

        return {
            technician: createdTechnician,
            credentials: {
                email: user.email,
                password: plainPassword,
            },
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getFacilityTechniciansService = async (facilityId, query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const where = { company_id: facilityId };
    if (query.status) {
        where.status = query.status;
    }

    const { count, rows } = await Technician.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "fullName", "email", "phone", "role_id"],
            },
        ],
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

module.exports = {
    facilityLoginService,
    createFacilityCompanyByOwnerService,
    getAllFacilitiesService,
    getMyCreatedFacilitiesService,
    getFacilityByIdService,
    getFacilityProfileService,
    updateFacilityProfileService,
    createTechnicianByFacilityService,
    getFacilityTechniciansService,
};

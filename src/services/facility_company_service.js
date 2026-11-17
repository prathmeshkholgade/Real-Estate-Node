const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("../models");
const facilityCompanyRepository = require("../repositories/facility_company_repository");
const technicianRepository = require("../repositories/technician_repository");
const authRepository = require("../repositories/auth_repository");
const { generateFacilityToken } = require("../utils/helper");
const ExpressError = require("../utils/express_error");
const s3Service = require("./s3.service");
const logger = require("../utils/logger");

class FacilityCompanyService {
    async facilityLogin(email, password) {
        const company = await facilityCompanyRepository.findByEmail(email);

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
    }

    async createFacilityCompanyByOwner(data, ownerId) {
        const { company_name, email, phone, address, password, status = "active" } = data;

        const existingCompany = await facilityCompanyRepository.findByEmail(email);

        if (existingCompany) {
            throw new ExpressError(409, "Facility company already exists with this email");
        }

        const plainPassword =
            password && password.trim().length >= 6
                ? password.trim()
                : `Fac@${Math.floor(100000 + Math.random() * 900000)}`;

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const company = await facilityCompanyRepository.create({
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
    }

    async getAllFacilities(query = {}) {
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

        const result = await facilityCompanyRepository.findFacilities(where, {
            limit,
            offset,
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
    }

    async getMyCreatedFacilities(ownerId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const result = await facilityCompanyRepository.findOwnerCreated(ownerId, {
            limit,
            offset,
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
    }

    async getFacilityById(facilityId) {
        const company = await facilityCompanyRepository.findCompanyWithDetails(facilityId);

        if (!company) {
            throw new ExpressError(404, "Facility management company not found");
        }

        return company;
    }

    async getFacilityProfile(facilityId) {
        const company = await facilityCompanyRepository.findCompanyProfile(facilityId);

        if (!company) {
            throw new ExpressError(404, "Facility management company not found");
        }

        return company;
    }

    async updateFacilityProfile(facilityId, updateData) {
        const company = await facilityCompanyRepository.findById(facilityId);

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
    }

    async createTechnicianByFacility(facilityId, data) {
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

        const company = await facilityCompanyRepository.findById(facilityId);
        if (!company) {
            throw new ExpressError(404, "Facility management company not found");
        }

        if (company.status === "inactive" || company.status === "suspended") {
            throw new ExpressError(
                403,
                `Facility company account is ${company.status}. Please contact administrator.`
            );
        }

        const existingUserEmail = await authRepository.findByEmail(email);
        if (existingUserEmail) {
            throw new ExpressError(409, "User already exists with this email");
        }

        const existingUserPhone = await authRepository.findByPhone(phone);
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
            const user = await authRepository.create(
                {
                    fullName,
                    email,
                    phone,
                    password: hashedPassword,
                    role_id: 5,
                },
                { transaction: t }
            );

            const technician = await technicianRepository.create(
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

            const createdTechnician = await technicianRepository.findTechnicianWithDetails(technician.id);

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
    }

    async getFacilityTechnicians(facilityId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const { count, rows } = await technicianRepository.findCompanyTechnicians(facilityId, {
            limit,
            offset,
            status: query.status,
        });

        return {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: rows,
        };
    }

    async updateTechnicianProfile(userId, file) {
        logger.info("========== UPDATE TECHNICIAN PROFILE START ==========");
        logger.info(`User ID: ${userId}`);
        logger.info(`File received: ${file ? file.originalname : "No file"}`);

        const technician = await technicianRepository.findByUserId(userId);

        logger.info(`Technician found: ${!!technician}`);

        if (!technician) {
            logger.error(`Technician not found for user_id: ${userId}`);
            throw new ExpressError(404, "Technician does not exist");
        }

        logger.info(`Technician ID: ${technician.id}`);
        logger.info(`Old profile image: ${technician.profile_image}`);

        const oldKey = technician.profile_image;

        logger.info("Uploading new image to S3...");

        const key = await s3Service.uploadFileToS3(file, "technicians/profile");

        logger.info(`New S3 key: ${key}`);

        try {
            logger.info("Updating technician database record...");

            await technician.update({
                profile_image: key,
            });

            const updatedTechnician = await technicianRepository.findById(technician.id);

            logger.info(`Updated profile image from DB: ${updatedTechnician?.profile_image}`);
        } catch (error) {
            logger.error(`Database update failed: ${error.message}`);
            await s3Service.deleteS3File(key);
            throw error;
        }

        if (oldKey) {
            logger.info(`Deleting old S3 image: ${oldKey}`);
            await s3Service.deleteS3File(oldKey);
            logger.info("Old S3 image deleted successfully");
        }

        const url = await s3Service.getS3FileUrl(key);

        logger.info("Technician profile updated successfully");
        logger.info("========== UPDATE TECHNICIAN PROFILE END ==========");

        return {
            technician,
            key,
            url,
        };
    }
}

const facilityCompanyService = new FacilityCompanyService();

facilityCompanyService.facilityLoginService = facilityCompanyService.facilityLogin.bind(facilityCompanyService);
facilityCompanyService.createFacilityCompanyByOwnerService = facilityCompanyService.createFacilityCompanyByOwner.bind(facilityCompanyService);
facilityCompanyService.getAllFacilitiesService = facilityCompanyService.getAllFacilities.bind(facilityCompanyService);
facilityCompanyService.getMyCreatedFacilitiesService = facilityCompanyService.getMyCreatedFacilities.bind(facilityCompanyService);
facilityCompanyService.getFacilityByIdService = facilityCompanyService.getFacilityById.bind(facilityCompanyService);
facilityCompanyService.getFacilityProfileService = facilityCompanyService.getFacilityProfile.bind(facilityCompanyService);
facilityCompanyService.updateFacilityProfileService = facilityCompanyService.updateFacilityProfile.bind(facilityCompanyService);
facilityCompanyService.createTechnicianByFacilityService = facilityCompanyService.createTechnicianByFacility.bind(facilityCompanyService);
facilityCompanyService.getFacilityTechniciansService = facilityCompanyService.getFacilityTechnicians.bind(facilityCompanyService);
facilityCompanyService.updateTechnicianProfileService = facilityCompanyService.updateTechnicianProfile.bind(facilityCompanyService);

module.exports = facilityCompanyService;

const BaseRepository = require("./base_repository");
const { Technician, User, FacilityManagementCompany } = require("../models");

class TechnicianRepository extends BaseRepository {
    constructor() {
        super(Technician);
    }

    async findByUserId(userId) {
        return await this.findOne({
            user_id: userId,
        });
    }

    async findTechnicianWithDetails(id) {
        return await this.findById(id, {
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
    }

    async findCompanyTechnicians(companyId, options = {}) {
        const { limit, offset, status } = options;
        const where = { company_id: companyId };

        if (status) {
            where.status = status;
        }

        return await this.findAndCountAll({
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
    }
}

module.exports = new TechnicianRepository();


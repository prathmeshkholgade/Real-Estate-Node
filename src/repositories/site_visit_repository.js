const { Op, Sequelize } = require("sequelize");
const BaseRepository = require("./base_repository");
const { PropertySiteVisit, Property, User, PropertyMedia } = require("../models");

class SiteVisitRepository extends BaseRepository {
    constructor() {
        super(PropertySiteVisit);
    }

    async findOverlappingConfirmed(propertyId, targetDate, startTime, endTime, excludeVisitId = null) {
        const where = {
            property_id: propertyId,
            status: "confirmed",
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn(
                        "COALESCE",
                        Sequelize.col("scheduled_date"),
                        Sequelize.col("preferred_date")
                    ),
                    targetDate
                ),
                Sequelize.where(
                    Sequelize.fn(
                        "COALESCE",
                        Sequelize.col("scheduled_start_time"),
                        Sequelize.col("start_time")
                    ),
                    "<",
                    endTime
                ),
                Sequelize.where(
                    Sequelize.fn(
                        "COALESCE",
                        Sequelize.col("scheduled_end_time"),
                        Sequelize.col("end_time")
                    ),
                    ">",
                    startTime
                ),
            ],
        };

        if (excludeVisitId) {
            where.id = { [Op.ne]: excludeVisitId };
        }

        return await this.findOne(where);
    }

    async findVisitWithProperty(visitId) {
        return await this.findById(visitId, {
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "property_type", "listing_type", "price", "address", "city", "status", "user_id"],
                },
            ],
        });
    }

    async findVisitWithAllDetails(visitId) {
        return await this.findById(visitId, {
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "property_type", "listing_type", "price", "address", "city", "status", "user_id"],
                    include: [
                        {
                            model: PropertyMedia,
                            as: "media",
                            attributes: ["id", "file_url", "media_type", "is_primary"],
                            required: false,
                        },
                    ],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: User,
                    as: "reviewer",
                    attributes: ["id", "fullName", "email"],
                },
            ],
        });
    }

    async findBuyerVisits(buyerId, options = {}) {
        const { limit, offset, status } = options;
        const where = { user_id: buyerId };

        if (status) {
            where.status = status;
        }

        return await this.findAndCountAll({
            where,
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "property_type", "listing_type", "price", "address", "city", "status"],
                    include: [
                        {
                            model: PropertyMedia,
                            as: "media",
                            attributes: ["id", "file_url", "media_type", "is_primary"],
                            required: false,
                        },
                    ],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }

    async findOwnerVisits(ownedPropertyIds, options = {}) {
        const { limit, offset, status, date } = options;
        const where = {
            property_id: { [Op.in]: ownedPropertyIds },
        };

        if (status) {
            where.status = status;
        }

        if (date) {
            where[Op.or] = [
                { scheduled_date: date },
                { preferred_date: date },
            ];
        }

        return await this.findAndCountAll({
            where,
            include: [
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "title", "property_type", "listing_type", "price", "address", "city", "status"],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: User,
                    as: "reviewer",
                    attributes: ["id", "fullName", "email"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }
}

module.exports = new SiteVisitRepository();


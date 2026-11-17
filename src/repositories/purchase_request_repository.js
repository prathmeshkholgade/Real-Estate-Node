const { Op } = require("sequelize");
const BaseRepository = require("./base_repository");
const {
    PropertyPurchaseRequest,
    Property,
    User,
    PropertySiteVisit,
    PropertyPurchasePayment,
    PropertyMedia,
} = require("../models");

class PurchaseRequestRepository extends BaseRepository {
    constructor() {
        super(PropertyPurchaseRequest);
    }

    async findRequestWithProperty(requestId) {
        return await this.findById(requestId, {
            include: [
                {
                    model: Property,
                    as: "property",
                },
            ],
        });
    }

    async findRequestWithBuyerAndProperty(requestId) {
        return await this.findById(requestId, {
            include: [
                {
                    model: Property,
                    as: "property",
                },
                {
                    model: User,
                    as: "buyer",
                },
            ],
        });
    }

    async findRequestWithAllDetails(requestId) {
        return await this.findById(requestId, {
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
                    as: "buyer",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: User,
                    as: "reviewer",
                    attributes: ["id", "fullName", "email"],
                },
                {
                    model: PropertySiteVisit,
                    as: "siteVisit",
                    attributes: ["id", "status", "scheduled_date", "preferred_date"],
                },
                {
                    model: PropertyPurchasePayment,
                    as: "payments",
                },
            ],
        });
    }

    async findBuyerRequests(buyerId, options = {}) {
        const { limit, offset, status } = options;
        const where = { buyer_id: buyerId };

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
                {
                    model: PropertyPurchasePayment,
                    as: "payments",
                    attributes: ["id", "amount", "status", "payment_method", "paid_at"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }

    async findOwnerRequests(ownedPropertyIds, options = {}) {
        const { limit, offset, status } = options;
        const where = {
            property_id: { [Op.in]: ownedPropertyIds },
        };

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
                },
                {
                    model: User,
                    as: "buyer",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: PropertySiteVisit,
                    as: "siteVisit",
                    attributes: ["id", "status", "scheduled_date", "preferred_date"],
                },
                {
                    model: PropertyPurchasePayment,
                    as: "payments",
                    attributes: ["id", "amount", "status", "payment_method", "paid_at"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }

    async findActiveAcceptedRequest(propertyId, excludeRequestId = null) {
        const where = {
            property_id: propertyId,
            status: "accepted",
        };

        if (excludeRequestId) {
            where.id = { [Op.ne]: excludeRequestId };
        }

        return await this.findOne(where);
    }
}

module.exports = new PurchaseRequestRepository();


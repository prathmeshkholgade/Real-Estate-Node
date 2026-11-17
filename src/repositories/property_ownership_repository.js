const BaseRepository = require("./base_repository");
const { PropertyOwnership, User, PropertyPurchaseRequest } = require("../models");

class PropertyOwnershipRepository extends BaseRepository {
    constructor() {
        super(PropertyOwnership);
    }

    async findActiveOwnership(propertyId, options = {}) {
        return await this.findOne(
            {
                property_id: propertyId,
                status: "active",
            },
            {
                include: [
                    {
                        model: User,
                        as: "owner",
                        attributes: ["id", "fullName", "email", "phone"],
                    },
                    {
                        model: PropertyPurchaseRequest,
                        as: "purchaseRequest",
                        attributes: ["id", "agreed_price", "offered_price", "completed_at", "status"],
                    },
                ],
                ...options,
            }
        );
    }

    async findActiveOwnerships(propertyId, options = {}) {
        return await this.findAll({
            where: {
                property_id: propertyId,
                status: "active",
            },
            ...options,
        });
    }

    async findOwnershipHistory(propertyId) {
        return await this.findAll({
            where: {
                property_id: propertyId,
                status: "inactive",
            },
            order: [
                ["acquired_at", "DESC"],
                ["createdAt", "DESC"],
            ],
            include: [
                {
                    model: User,
                    as: "owner",
                    attributes: ["id", "fullName", "email", "phone"],
                },
                {
                    model: PropertyPurchaseRequest,
                    as: "purchaseRequest",
                    attributes: ["id", "agreed_price", "offered_price", "completed_at", "status"],
                },
            ],
        });
    }
}

module.exports = new PropertyOwnershipRepository();


const BaseRepository = require("./base_repository");
const {
    Property,
    PropertyDetail,
    PropertyConfiguration,
    PropertyMedia,
    PropertyDocument,
    Amenity,
} = require("../models");

class PropertyRepository extends BaseRepository {
    constructor() {
        super(Property);
    }

    async findUserProperties(userId, options = {}) {
        const { limit, offset } = options;
        return await this.findAndCountAll({
            where: {
                user_id: userId,
            },
            attributes: [
                "id",
                "title",
                "description",
                "property_type",
                "listing_type",
                "price",
                "current_step",
                "createdAt",
            ],
            include: [
                {
                    model: PropertyDetail,
                    as: "details",
                    attributes: ["id", "property_id", "bedrooms", "bathrooms"],
                },
                {
                    model: PropertyConfiguration,
                    as: "configuration",
                    attributes: ["parking_count", "possession_status", "ownership_type"],
                },
                {
                    model: PropertyMedia,
                    as: "media",
                    attributes: ["original_name", "file_url", "media_type"],
                },
            ],
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
        });
    }

    async findPropertyWithAllDetails(propertyId, userId) {
        return await this.findOne(
            {
                id: propertyId,
                user_id: userId,
            },
            {
                include: [
                    {
                        model: PropertyDetail,
                        as: "details",
                    },
                    {
                        model: PropertyConfiguration,
                        as: "configuration",
                    },
                    {
                        model: PropertyMedia,
                        as: "media",
                    },
                    {
                        model: PropertyDocument,
                        as: "documents",
                    },
                    {
                        model: Amenity,
                        as: "amenities",
                    },
                ],
            }
        );
    }

    async findOwnedProperty(propertyId, userId) {
        return await this.findOne({
            id: propertyId,
            user_id: userId,
        });
    }
}

module.exports = new PropertyRepository();


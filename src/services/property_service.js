const propertyRepository = require("../repositories/property_repository");
const propertyDetailRepository = require("../repositories/property_detail_repository");
const propertyConfigurationRepository = require("../repositories/property_configuration_repository");
const propertyMediaRepository = require("../repositories/property_media_repository");
const propertyDocumentRepository = require("../repositories/property_document_repository");
const uploadToCloudinary = require("../utils/upload_to_cloudinary");

class PropertyService {
    async findOwnedPropertyOrThrow(propertyId, userId) {
        const property = await propertyRepository.findOwnedProperty(propertyId, userId);

        if (!property) {
            const error = new Error("Property not found");
            error.statusCode = 404;
            throw error;
        }

        return property;
    }

    async getAllProperties(userId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const result = await propertyRepository.findUserProperties(userId, {
            limit,
            offset,
        });

        return {
            properties: result.rows,
            pagination: {
                totalRecords: result.count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    async getPropertyById(userId, propertyId) {
        const property = await propertyRepository.findPropertyWithAllDetails(propertyId, userId);

        if (!property) {
            throw new Error("Property not found");
        }

        return property;
    }

    async createPropertyBasicInfo(data, userId) {
        const {
            title,
            description,
            property_type,
            listing_type,
            price,
            address,
            locality,
            city,
            state,
            country,
            postal_code,
        } = data;

        const property = await propertyRepository.create({
            title,
            description,
            property_type,
            listing_type,
            price,
            address,
            locality,
            city,
            state,
            country,
            postal_code,
            user_id: userId,
            status: "draft",
            current_step: 1,
        });

        return property;
    }

    async updatePropertyBasicInfo(id, data, userId) {
        const property = await this.findOwnedPropertyOrThrow(id, userId);

        const {
            title,
            description,
            property_type,
            listing_type,
            price,
            address,
            locality,
            city,
            state,
            country,
            postal_code,
        } = data;

        await property.update({
            title,
            description,
            property_type,
            listing_type,
            price,
            address,
            locality,
            city,
            state,
            country,
            postal_code,
        });

        return property;
    }

    async upsertPropertyDetails(propertyId, body, userId) {
        const property = await this.findOwnedPropertyOrThrow(propertyId, userId);

        let detail = await propertyDetailRepository.findByPropertyId(property.id);

        if (detail) {
            await detail.update(body);
        } else {
            detail = await propertyDetailRepository.create({
                ...body,
                property_id: property.id,
            });
        }

        if (property.current_step < 2) {
            await property.update({
                current_step: 2,
            });
        }

        return {
            property,
            detail,
        };
    }

    async upsertPropertyConfiguration(propertyId, userId, data) {
        const { amenity_ids, ...configData } = data;

        const property = await this.findOwnedPropertyOrThrow(propertyId, userId);

        let configuration = await propertyConfigurationRepository.findByPropertyId(property.id);

        if (configuration) {
            await configuration.update(configData);
        } else {
            configuration = await propertyConfigurationRepository.create({
                ...configData,
                property_id: property.id,
            });
        }

        if (Array.isArray(amenity_ids)) {
            await property.setAmenities(amenity_ids);
        }

        if (property.current_step < 3) {
            await property.update({
                current_step: 3,
            });
        }

        const updatedAmenities = await property.getAmenities({
            joinTableAttributes: [],
        });

        return {
            property_id: property.id,
            current_step: property.current_step,
            configuration,
            amenities: updatedAmenities,
        };
    }

    async addPropertyMedia(propertyId, userId, files = {}) {
        const property = await this.findOwnedPropertyOrThrow(propertyId, userId);

        const images = files.images || [];
        const videos = files.videos || [];

        if (images.length === 0 && videos.length === 0) {
            return {
                current_step: property.current_step,
                media: [],
            };
        }

        const uploadedImages = await Promise.all(
            images.map(async (file) => {
                const media = await uploadToCloudinary(file, "properties/images");

                return {
                    ...media,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                    media_type: "image",
                };
            })
        );

        const uploadedVideos = await Promise.all(
            videos.map(async (file) => {
                const media = await uploadToCloudinary(file, "properties/videos");

                return {
                    ...media,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                    media_type: "video",
                };
            })
        );

        const mediaData = [...uploadedImages, ...uploadedVideos].map((media) => ({
            property_id: property.id,
            media_type: media.media_type,
            file_url: media.url,
            mime_type: media.mime_type,
            original_name: media.original_name,
        }));

        const propertyMedia = await propertyMediaRepository.bulkCreate(mediaData);

        if (property.current_step < 4) {
            await property.update({
                current_step: 4,
            });
        }

        return {
            current_step: property.current_step,
            media: propertyMedia,
        };
    }

    async addPropertyDocuments(propertyId, userId, documents = []) {
        const property = await this.findOwnedPropertyOrThrow(propertyId, userId);

        if (documents.length === 0) {
            return {
                current_step: property.current_step,
                documents: [],
            };
        }

        const uploadedDocuments = await Promise.all(
            documents.map(async (file) => {
                const document = await uploadToCloudinary(file, "properties/documents");

                return {
                    ...document,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                };
            })
        );

        const documentData = uploadedDocuments.map((doc) => ({
            property_id: property.id,
            document_type: doc.format,
            file_url: doc.url,
            file_size: doc.bytes,
        }));

        const savedDocuments = await propertyDocumentRepository.bulkCreate(documentData);

        if (property.current_step < 5) {
            await property.update({
                current_step: 5,
                status: "published",
            });
        }

        return {
            current_step: property.current_step,
            documents: savedDocuments,
        };
    }
}

const propertyService = new PropertyService();

propertyService.createPropertyBasicInfoService = propertyService.createPropertyBasicInfo.bind(propertyService);
propertyService.updatePropertyBasicInfoService = propertyService.updatePropertyBasicInfo.bind(propertyService);
propertyService.upsertPropertyDetailsService = propertyService.upsertPropertyDetails.bind(propertyService);
propertyService.upsertPropertyConfigurationService = propertyService.upsertPropertyConfiguration.bind(propertyService);
propertyService.addPropertyMediaService = propertyService.addPropertyMedia.bind(propertyService);
propertyService.addPropertyDocumentsService = propertyService.addPropertyDocuments.bind(propertyService);
propertyService.getPropertyByIdService = propertyService.getPropertyById.bind(propertyService);
propertyService.getAllPropertiesService = propertyService.getAllProperties.bind(propertyService);

module.exports = propertyService;

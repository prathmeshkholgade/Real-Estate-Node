
const {
    Property,
    PropertyDetail,
    PropertyConfiguration,
    PropertyMedia,
    PropertyDocument,
} = require("../models");
const { findOwnedPropertyOrThrow } = require("../utils/helper");

const uploadToCloudinary = require("../utils/upload_to_cloudinary");



const getPropertyByIdService = async (userId, propertyId) => {
    const property = await Property.findOne({
        where: {
            id: propertyId,
            user_id: userId,
        },
        include: {
            
        }
    });

    if (!property) {
        throw new Error("Property not found");
    }

    return property;
};

const createPropertyBasicInfoService = async (data, userId) => {
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

    const property = await Property.create({
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
};

const updatePropertyBasicInfoService = async (id, data, userId) => {
    const property = await findOwnedPropertyOrThrow(id, userId);

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
};

const upsertPropertyDetailsService = async (
    propertyId,
    body,
    userId
) => {
    const property = await findOwnedPropertyOrThrow(
        propertyId,
        userId
    );

    let detail = await PropertyDetail.findOne({
        where: {
            property_id: property.id,
        },
    });

    if (detail) {
        await detail.update(body);
    } else {
        detail = await PropertyDetail.create({
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
};

const upsertPropertyConfigurationService = async (
    propertyId,
    userId,
    data
) => {
    const { amenity_ids, ...configData } = data;

    const property = await findOwnedPropertyOrThrow(
        propertyId,
        userId
    );

    let configuration = await PropertyConfiguration.findOne({
        where: {
            property_id: property.id,
        },
    });

    if (configuration) {
        await configuration.update(configData);
    } else {
        configuration = await PropertyConfiguration.create({
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
};

const addPropertyMediaService = async (
    propertyId,
    userId,
    files = {}
) => {
    const property = await findOwnedPropertyOrThrow(
        propertyId,
        userId
    );

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
            const media = await uploadToCloudinary(
                file,
                "properties/images"
            );

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
            const media = await uploadToCloudinary(
                file,
                "properties/videos"
            );

            return {
                ...media,
                original_name: file.originalname,
                mime_type: file.mimetype,
                media_type: "video",
            };
        })
    );

    const mediaData = [
        ...uploadedImages,
        ...uploadedVideos,
    ].map((media) => ({
        property_id: property.id,
        media_type: media.media_type,
        file_url: media.url,
        mime_type: media.mime_type,
        original_name: media.original_name,
    }));

    const propertyMedia = await PropertyMedia.bulkCreate(
        mediaData
    );

    if (property.current_step < 4) {
        await property.update({
            current_step: 4,
        });
    }

    return {
        current_step: property.current_step,
        media: propertyMedia,
    };
};

const addPropertyDocumentsService = async (
    propertyId,
    userId,
    documents = []
) => {
    const property = await findOwnedPropertyOrThrow(
        propertyId,
        userId
    );

    if (documents.length === 0) {
        return {
            current_step: property.current_step,
            documents: [],
        };
    }

    const uploadedDocuments = await Promise.all(
        documents.map(async (file) => {
            const document = await uploadToCloudinary(
                file,
                "properties/documents"
            );

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

    const savedDocuments = await PropertyDocument.bulkCreate(
        documentData
    );

    if (property.current_step < 5) {
        await property.update({
            current_step: 5,
        });
    }

    return {
        current_step: property.current_step,
        documents: savedDocuments,
    };
};

module.exports = {
    createPropertyBasicInfoService,
    updatePropertyBasicInfoService,
    upsertPropertyDetailsService,
    upsertPropertyConfigurationService,
    addPropertyMediaService,
    addPropertyDocumentsService,
    getPropertyByIdService
};

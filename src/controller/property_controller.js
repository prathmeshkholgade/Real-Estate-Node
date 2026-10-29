const {
    Property,
    PropertyDetail,
    PropertyConfiguration,
    PropertyMedia,
    PropertyDocument,
    Amenity,
} = require("../models");
const { createPropertyBasicInfoService, updatePropertyBasicInfoService } = require("../services/property_service");


const getPropertyById = async (req, res) => {
    const { id } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
        include: [
            { model: PropertyDetail, as: "details" },
            { model: PropertyConfiguration, as: "configuration" },
            { model: PropertyMedia, as: "media" },
            { model: PropertyDocument, as: "documents" },
            { model: Amenity, as: "amenities", through: { attributes: [] } },
        ],
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            property,
        },
    });
};


const createPropertyBasicInfo = async (req, res) => {
    const property = await createPropertyBasicInfoService(
        req.body,
        req.user.id
    );

    return res.status(201).json({
        success: true,
        message: "Property basic information saved successfully",
        data: {
            property_id: property.id,
            current_step: property.current_step,
            status: property.status,
            property,
        },
    });
};

const updatePropertyBasicInfo = async (req, res) => {
    const { id } = req.params;

    const property = await updatePropertyBasicInfoService(
        id,
        req.body,
        req.user.id
    );

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Property basic information updated successfully",
        data: {
            property_id: property.id,
            current_step: property.current_step,
            status: property.status,
            property,
        },
    });
};



const upsertPropertyDetails = async (req, res) => {
    const { id } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    let detail = await PropertyDetail.findOne({
        where: { property_id: property.id },
    });

    if (detail) {
        await detail.update(req.body);
    } else {
        detail = await PropertyDetail.create({
            ...req.body,
            property_id: property.id,
        });
    }

    if (property.current_step < 2) {
        await property.update({ current_step: 2 });
    }

    return res.status(200).json({
        success: true,
        message: "Property details saved successfully",
        data: {
            property_id: property.id,
            current_step: Math.max(property.current_step, 2),
            details: detail,
        },
    });
};


const upsertPropertyConfiguration = async (req, res) => {
    const { id } = req.params;
    const { amenity_ids, ...configData } = req.body;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    let configuration = await PropertyConfiguration.findOne({
        where: { property_id: property.id },
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
        await property.update({ current_step: 3 });
    }

    const updatedAmenities = await property.getAmenities({
        joinTableAttributes: [],
    });

    return res.status(200).json({
        success: true,
        message: "Property configuration saved successfully",
        data: {
            property_id: property.id,
            current_step: Math.max(property.current_step, 3),
            configuration,
            amenities: updatedAmenities,
        },
    });
};


const addPropertyMedia = async (req, res) => {
    const { id } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const rawItems = Array.isArray(req.body)
        ? req.body
        : Array.isArray(req.body.media)
            ? req.body.media
            : [req.body];

    const itemsToCreate = rawItems.map((item) => ({
        ...item,
        property_id: property.id,
    }));

    const createdMedia = await PropertyMedia.bulkCreate(itemsToCreate);

    if (property.current_step < 4) {
        await property.update({ current_step: 4 });
    }

    return res.status(201).json({
        success: true,
        message: "Property media uploaded successfully",
        data: {
            property_id: property.id,
            current_step: Math.max(property.current_step, 4),
            media: createdMedia,
        },
    });
};


const deletePropertyMedia = async (req, res) => {
    const { id, mediaId } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const mediaItem = await PropertyMedia.findOne({
        where: {
            id: mediaId,
            property_id: property.id,
        },
    });

    if (!mediaItem) {
        return res.status(404).json({
            success: false,
            message: "Media item not found",
        });
    }

    await mediaItem.destroy();

    return res.status(200).json({
        success: true,
        message: "Property media deleted successfully",
    });
};


const addPropertyDocuments = async (req, res) => {
    const { id } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const rawDocs = Array.isArray(req.body)
        ? req.body
        : Array.isArray(req.body.documents)
            ? req.body.documents
            : [req.body];

    const docsToCreate = rawDocs.map((doc) => ({
        ...doc,
        property_id: property.id,
        verification_status: "pending",
    }));

    const createdDocs = await PropertyDocument.bulkCreate(docsToCreate);

    if (property.current_step < 5) {
        await property.update({ current_step: 5 });
    }

    return res.status(201).json({
        success: true,
        message: "Property documents uploaded successfully",
        data: {
            property_id: property.id,
            current_step: Math.max(property.current_step, 5),
            documents: createdDocs,
        },
    });
};


const deletePropertyDocument = async (req, res) => {
    const { id, docId } = req.params;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const document = await PropertyDocument.findOne({
        where: {
            id: docId,
            property_id: property.id,
        },
    });

    if (!document) {
        return res.status(404).json({
            success: false,
            message: "Document not found",
        });
    }

    await document.destroy();

    return res.status(200).json({
        success: true,
        message: "Property document deleted successfully",
    });
};


const submitProperty = async (req, res) => {
    const { id } = req.params;
    const { status = "submitted", remarks } = req.body;

    const property = await Property.findOne({
        where: {
            id,
            user_id: req.user.id,
        },
        include: [
            { model: PropertyDetail, as: "details" },
            { model: PropertyConfiguration, as: "configuration" },
            { model: PropertyMedia, as: "media" },
            { model: PropertyDocument, as: "documents" },
            { model: Amenity, as: "amenities", through: { attributes: [] } },
        ],
    });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const missingSteps = [];
    if (!property.title || !property.price || !property.property_type || !property.address) {
        missingSteps.push("Step 1: Basic Information");
    }
    if (!property.details) {
        missingSteps.push("Step 2: Property Details");
    }
    if (!property.configuration) {
        missingSteps.push("Step 3: Property Configuration");
    }

    if (missingSteps.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot submit property. Missing required steps: ${missingSteps.join(", ")}`,
            missingSteps,
        });
    }

    await property.update({
        status,
        current_step: 6,
    });

    return res.status(200).json({
        success: true,
        message: "Property submitted successfully for review",
        data: {
            property_id: property.id,
            status: property.status,
            current_step: property.current_step,
            remarks: remarks || null,
            property,
        },
    });
};

module.exports = {
    getPropertyById,
    createPropertyBasicInfo,
    updatePropertyBasicInfo,
    upsertPropertyDetails,
    upsertPropertyConfiguration,
    addPropertyMedia,
    deletePropertyMedia,
    addPropertyDocuments,
    deletePropertyDocument,
    submitProperty,
};

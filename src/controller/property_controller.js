const propertyService = require("../services/property_service");

const getAllProperties = async (req, res) => {
    const result = await propertyService.getAllProperties(
        req.user.id,
        req.query
    );

    return res.status(200).json({
        success: true,
        message: "Properties fetched successfully",
        data: result,
    });
};

const getPropertyById = async (req, res) => {
    const property = await propertyService.getPropertyById(
        req.user.id,
        req.params.id
    );

    return res.status(200).json({
        success: true,
        message: "Property fetched successfully",
        data: property,
    });
};

const createPropertyBasicInfo = async (req, res) => {
    const property = await propertyService.createPropertyBasicInfo(
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

    const property = await propertyService.updatePropertyBasicInfo(
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
    const result = await propertyService.upsertPropertyDetails(
        req.params.id,
        req.body,
        req.user.id
    );

    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    const { property, detail } = result;

    return res.status(200).json({
        success: true,
        message: "Property details saved successfully",
        data: {
            property_id: property.id,
            current_step: property.current_step,
            details: detail,
        },
    });
};

const upsertPropertyConfiguration = async (req, res) => {
    const { id } = req.params;

    const result = await propertyService.upsertPropertyConfiguration(
        id,
        req.user.id,
        req.body
    );

    if (!result) {
        return res.status(404).json({
            success: false,
            message: "Property not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Property configuration saved successfully",
        data: result,
    });
};

const addPropertyMedia = async (req, res) => {
    const media = await propertyService.addPropertyMedia(
        req.params.id,
        req.user.id,
        req.files
    );

    return res.status(201).json({
        success: true,
        message: "Property media uploaded successfully",
        data: media,
    });
};

const addPropertyDocuments = async (req, res) => {
    const documents = await propertyService.addPropertyDocuments(
        req.params.id,
        req.user.id,
        req.files.documents
    );

    return res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        data: documents,
    });
};

module.exports = {
    getPropertyById,
    createPropertyBasicInfo,
    updatePropertyBasicInfo,
    upsertPropertyDetails,
    upsertPropertyConfiguration,
    addPropertyMedia,
    addPropertyDocuments,
    getAllProperties,
};

const { createPropertyBasicInfoService, updatePropertyBasicInfoService, upsertPropertyDetailsService, upsertPropertyConfigurationService, addPropertyMediaService, addPropertyDocumentsService, getPropertyByIdService } = require("../services/property_service");


const getPropertyById = async (req, res) => {
    const property = await getPropertyByIdService(
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
    const result = await upsertPropertyDetailsService(
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
}


const upsertPropertyConfiguration = async (req, res) => {
    const { id } = req.params;

    const result = await upsertPropertyConfigurationService(
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
    const media = await addPropertyMediaService(req.params.id, req.user.id, req.files);

    return res.status(201).json({
        success: true,
        message: "Property media uploaded successfully",
        data: media,
    });
};


const addPropertyDocuments = async (req, res) => {

    const documents = await addPropertyDocumentsService(req.params.id, req.user.id, req.files.documents);
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
    getPropertyById
};

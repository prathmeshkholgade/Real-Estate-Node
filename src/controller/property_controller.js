const { Property } = require("../models");

const createPropertyBasicInfo = async (req, res) => {
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
    } = req.body;

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
        user_id: req.user.id,
        status: "draft",
        current_step: 1,
    });

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
    } = req.body;

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


module.exports = { createPropertyBasicInfo, updatePropertyBasicInfo }








const { Property } = require("../models");

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
    const property = await Property.findOne({
        where: {
            id,
            user_id: userId,
        },
    });

    if (!property) {
        return null;
    }

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

module.exports = {
    createPropertyBasicInfoService,
    updatePropertyBasicInfoService,
};

const jwt = require("jsonwebtoken");
const { Property } = require("../models");

const generateToken = (userId) => {
    const token = jwt.sign(
        {
            id: userId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
    );
    return token;
};

const generateFacilityToken = (company) => {
    const token = jwt.sign(
        {
            id: company.id,
            company_id: company.id,
            email: company.email,
            role: "Facility Management Company",
            type: "facility",
        },
        process.env.JWT_SECRET,
        { expiresIn: "90d" }
    );
    return token;
};

const findOwnedPropertyOrThrow = async (propertyId, userId) => {
    const property = await Property.findOne({
        where: {
            id: propertyId,
            user_id: userId,
        },
    });

    if (!property) {
        const error = new Error("Property not found");
        error.statusCode = 404;
        throw error;
    }

    return property;
};

module.exports = {
    generateToken,
    generateFacilityToken,
    findOwnedPropertyOrThrow,
};

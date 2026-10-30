const Joi = require("joi");


const baseUserSchema = {
    password: Joi.string()
        .min(6)
        .max(20)
        .required()
        .messages({
            "string.base": "Password must be a string",
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 20 characters",
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "Email must be a string",
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),
};

const userSchema = Joi.object({
    ...baseUserSchema,
    fullName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.base": "Full name must be a string",
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 3 characters",
            "string.max": "Full name cannot exceed 50 characters",
            "any.required": "Full name is required",
        }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.base": "Phone must be a string",
            "string.empty": "Phone is required",
            "string.pattern.base": "Phone must be exactly 10 digits",
            "any.required": "Phone is required",
        }),
    role_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Role ID must be a number",
            "number.integer": "Role ID must be an integer",
            "number.positive": "Role ID must be positive",
            "any.required": "Role ID is required",
        }),
});

const loginSchema = Joi.object({
    ...baseUserSchema,
});


const propertyIdParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Property ID must be a valid number",
            "number.integer": "Property ID must be an integer",
            "number.positive": "Property ID must be a positive integer",
            "any.required": "Property ID is required in URL parameter",
        }),
});

const propertyMediaParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Property ID must be a valid number",
            "any.required": "Property ID is required in URL parameter",
        }),
    mediaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Media ID must be a valid number",
            "any.required": "Media ID is required in URL parameter",
        }),
});

const propertyDocumentParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Property ID must be a valid number",
            "any.required": "Property ID is required in URL parameter",
        }),
    docId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Document ID must be a valid number",
            "any.required": "Document ID is required in URL parameter",
        }),
});


const PROPERTY_TYPES = [
    "apartment",
    "villa",
    "independent_house",
    "builder_floor",
    "plot",
    "commercial_office",
    "commercial_shop",
    "commercial_land",
    "warehouse",
    "other",
];

const LISTING_TYPES = ["sale", "rent", "lease"];

const propertyBasicInfoFields = {
    title: Joi.string()
        .trim()
        .min(5)
        .max(150)
        .messages({
            "string.base": "Title must be a string",
            "string.empty": "Title cannot be empty",
            "string.min": "Title must be at least 5 characters",
            "string.max": "Title cannot exceed 150 characters",
        }),
    description: Joi.string()
        .trim()
        .max(5000)
        .allow("", null)
        .messages({
            "string.base": "Description must be a string",
            "string.max": "Description cannot exceed 5000 characters",
        }),
    property_type: Joi.string()
        .trim()
        .valid(...PROPERTY_TYPES)
        .messages({
            "string.base": "Property type must be a string",
            "any.only": `Property type must be one of: ${PROPERTY_TYPES.join(", ")}`,
        }),
    listing_type: Joi.string()
        .trim()
        .valid(...LISTING_TYPES)
        .messages({
            "string.base": "Listing type must be a string",
            "any.only": `Listing type must be one of: ${LISTING_TYPES.join(", ")}`,
        }),
    price: Joi.number()
        .positive()
        .precision(2)
        .max(10000000000)
        .messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be greater than 0",
            "number.max": "Price is unrealistically high",
        }),
    address: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .messages({
            "string.base": "Address must be a string",
            "string.empty": "Address cannot be empty",
            "string.min": "Address must be at least 3 characters",
            "string.max": "Address cannot exceed 255 characters",
        }),
    locality: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.base": "Locality must be a string",
            "string.empty": "Locality cannot be empty",
            "string.min": "Locality must be at least 2 characters",
            "string.max": "Locality cannot exceed 100 characters",
        }),
    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.base": "City must be a string",
            "string.empty": "City cannot be empty",
            "string.min": "City must be at least 2 characters",
            "string.max": "City cannot exceed 100 characters",
        }),
    state: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.base": "State must be a string",
            "string.empty": "State cannot be empty",
            "string.min": "State must be at least 2 characters",
            "string.max": "State cannot exceed 100 characters",
        }),
    country: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .default("India")
        .messages({
            "string.base": "Country must be a string",
            "string.empty": "Country cannot be empty",
            "string.min": "Country must be at least 2 characters",
            "string.max": "Country cannot exceed 100 characters",
        }),
    postal_code: Joi.string()
        .trim()
        .pattern(/^[0-9]{5,10}$/)
        .messages({
            "string.base": "Postal code must be a string",
            "string.empty": "Postal code cannot be empty",
            "string.pattern.base": "Postal code must be between 5 and 10 digits",
        }),
};

const createPropertyBasicInfoSchema = Joi.object({
    title: propertyBasicInfoFields.title.required().messages({
        "any.required": "Title is required",
    }),
    description: propertyBasicInfoFields.description,
    property_type: propertyBasicInfoFields.property_type.required().messages({
        "any.required": "Property type is required",
    }),
    listing_type: propertyBasicInfoFields.listing_type.required().messages({
        "any.required": "Listing type is required",
    }),
    price: propertyBasicInfoFields.price.required().messages({
        "any.required": "Price is required",
    }),
    address: propertyBasicInfoFields.address.required().messages({
        "any.required": "Address is required",
    }),
    locality: propertyBasicInfoFields.locality.required().messages({
        "any.required": "Locality is required",
    }),
    city: propertyBasicInfoFields.city.required().messages({
        "any.required": "City is required",
    }),
    state: propertyBasicInfoFields.state.required().messages({
        "any.required": "State is required",
    }),
    country: propertyBasicInfoFields.country,
    postal_code: propertyBasicInfoFields.postal_code.required().messages({
        "any.required": "Postal code is required",
    }),
});

const updatePropertyBasicInfoSchema = Joi.object({
    title: propertyBasicInfoFields.title,
    description: propertyBasicInfoFields.description,
    property_type: propertyBasicInfoFields.property_type,
    listing_type: propertyBasicInfoFields.listing_type,
    price: propertyBasicInfoFields.price,
    address: propertyBasicInfoFields.address,
    locality: propertyBasicInfoFields.locality,
    city: propertyBasicInfoFields.city,
    state: propertyBasicInfoFields.state,
    country: propertyBasicInfoFields.country,
    postal_code: propertyBasicInfoFields.postal_code,
}).min(1).messages({
    "object.min": "At least one field must be provided to update property basic information",
});

const AREA_UNITS = ["sq.ft", "sq.yard", "sq.m", "acres", "hectares"];
const FURNISHING_STATUSES = ["unfurnished", "semi-furnished", "fully-furnished"];
const PROPERTY_CONDITIONS = ["new", "resale", "under_construction", "ready_to_move"];

const propertyDetailSchema = Joi.object({
    area: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            "number.base": "Area must be a number",
            "number.positive": "Area must be greater than 0",
            "any.required": "Area is required",
        }),
    area_unit: Joi.string()
        .trim()
        .valid(...AREA_UNITS)
        .default("sq.ft")
        .messages({
            "any.only": `Area unit must be one of: ${AREA_UNITS.join(", ")}`,
        }),
    built_up_area: Joi.number()
        .positive()
        .precision(2)
        .allow(null)
        .messages({
            "number.base": "Built-up area must be a number",
            "number.positive": "Built-up area must be greater than 0",
        }),
    carpet_area: Joi.number()
        .positive()
        .precision(2)
        .allow(null)
        .messages({
            "number.base": "Carpet area must be a number",
            "number.positive": "Carpet area must be greater than 0",
        }),
    bedrooms: Joi.number()
        .integer()
        .min(0)
        .max(50)
        .allow(null)
        .messages({
            "number.base": "Bedrooms must be a number",
            "number.min": "Bedrooms cannot be negative",
            "number.max": "Bedrooms count is too high",
        }),
    bathrooms: Joi.number()
        .integer()
        .min(0)
        .max(50)
        .allow(null)
        .messages({
            "number.base": "Bathrooms must be a number",
            "number.min": "Bathrooms cannot be negative",
            "number.max": "Bathrooms count is too high",
        }),
    balconies: Joi.number()
        .integer()
        .min(0)
        .max(20)
        .allow(null)
        .messages({
            "number.base": "Balconies must be a number",
            "number.min": "Balconies cannot be negative",
            "number.max": "Balconies count is too high",
        }),
    total_floors: Joi.number()
        .integer()
        .min(1)
        .max(200)
        .allow(null)
        .messages({
            "number.base": "Total floors must be a number",
            "number.min": "Total floors must be at least 1",
            "number.max": "Total floors count is too high",
        }),
    property_floor: Joi.number()
        .integer()
        .min(0)
        .max(200)
        .allow(null)
        .messages({
            "number.base": "Property floor must be a number",
            "number.min": "Property floor cannot be negative",
            "number.max": "Property floor count is too high",
        }),
    furnishing_status: Joi.string()
        .trim()
        .valid(...FURNISHING_STATUSES)
        .allow(null)
        .messages({
            "any.only": `Furnishing status must be one of: ${FURNISHING_STATUSES.join(", ")}`,
        }),
    condition: Joi.string()
        .trim()
        .valid(...PROPERTY_CONDITIONS)
        .allow(null)
        .messages({
            "any.only": `Condition must be one of: ${PROPERTY_CONDITIONS.join(", ")}`,
        }),
});


const FACING_DIRECTIONS = [
    "North",
    "South",
    "East",
    "West",
    "North-East",
    "North-West",
    "South-East",
    "South-West",
];
const OWNERSHIP_TYPES = ["freehold", "leasehold", "cooperative", "power_of_attorney"];
const POSSESSION_STATUSES = ["ready_to_move", "under_construction"];
const WATER_SUPPLY_TYPES = ["corporation", "borewell", "both", "none"];

const propertyConfigurationSchema = Joi.object({
    facing: Joi.string()
        .trim()
        .valid(...FACING_DIRECTIONS)
        .allow(null)
        .messages({
            "any.only": `Facing direction must be one of: ${FACING_DIRECTIONS.join(", ")}`,
        }),
    ownership_type: Joi.string()
        .trim()
        .valid(...OWNERSHIP_TYPES)
        .allow(null)
        .messages({
            "any.only": `Ownership type must be one of: ${OWNERSHIP_TYPES.join(", ")}`,
        }),
    possession_status: Joi.string()
        .trim()
        .valid(...POSSESSION_STATUSES)
        .allow(null)
        .messages({
            "any.only": `Possession status must be one of: ${POSSESSION_STATUSES.join(", ")}`,
        }),
    parking_count: Joi.number()
        .integer()
        .min(0)
        .max(50)
        .default(0)
        .messages({
            "number.base": "Parking count must be a number",
            "number.min": "Parking count cannot be negative",
        }),
    gated_community: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "Gated community must be a boolean",
        }),
    water_supply: Joi.string()
        .trim()
        .valid(...WATER_SUPPLY_TYPES)
        .allow(null)
        .messages({
            "any.only": `Water supply must be one of: ${WATER_SUPPLY_TYPES.join(", ")}`,
        }),
    power_backup: Joi.boolean()
        .default(false)
        .messages({
            "boolean.base": "Power backup must be a boolean",
        }),
    amenity_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .unique()
        .default([])
        .messages({
            "array.base": "Amenity IDs must be an array of integers",
            "array.unique": "Amenity IDs cannot contain duplicate IDs",
        }),
});



const MEDIA_TYPES = ["image", "video", "floor_plan", "virtual_tour"];

const singleMediaItemSchema = Joi.object({
    media_type: Joi.string()
        .trim()
        .valid(...MEDIA_TYPES)
        .default("image")
        .messages({
            "any.only": `Media type must be one of: ${MEDIA_TYPES.join(", ")}`,
        }),
    file_url: Joi.string()
        .trim()
        .uri()
        .max(2048)
        .required()
        .messages({
            "string.empty": "File URL is required",
            "string.uri": "File URL must be a valid URL",
            "any.required": "File URL is required",
        }),
    thumbnail_url: Joi.string()
        .trim()
        .uri()
        .max(2048)
        .allow("", null)
        .messages({
            "string.uri": "Thumbnail URL must be a valid URL",
        }),
    original_name: Joi.string()
        .trim()
        .max(255)
        .allow("", null),
    mime_type: Joi.string()
        .trim()
        .max(100)
        .allow("", null),
    file_size: Joi.number()
        .integer()
        .positive()
        .max(524288000)
        .allow(null)
        .messages({
            "number.base": "File size must be a number (in bytes)",
            "number.max": "File size cannot exceed 500 MB",
        }),
    is_primary: Joi.boolean().default(false),
    sort_order: Joi.number().integer().min(0).default(0),
});

const propertyMediaSchema = Joi.alternatives().try(
    singleMediaItemSchema,
    Joi.array().items(singleMediaItemSchema).min(1),
    Joi.object({
        media: Joi.array().items(singleMediaItemSchema).min(1).required().messages({
            "array.min": "At least one media item must be provided",
            "any.required": "Media list is required",
        }),
    })
);



const DOCUMENT_TYPES = [
    "title_deed",
    "property_tax_receipt",
    "occupancy_certificate",
    "building_plan_approval",
    "noc",
    "encumbrance_certificate",
    "other",
];

const singleDocumentItemSchema = Joi.object({
    document_type: Joi.string()
        .trim()
        .valid(...DOCUMENT_TYPES)
        .required()
        .messages({
            "string.empty": "Document type is required",
            "any.only": `Document type must be one of: ${DOCUMENT_TYPES.join(", ")}`,
            "any.required": "Document type is required",
        }),
    file_url: Joi.string()
        .trim()
        .uri()
        .max(2048)
        .required()
        .messages({
            "string.empty": "File URL is required",
            "string.uri": "File URL must be a valid URL",
            "any.required": "File URL is required",
        }),
    original_name: Joi.string()
        .trim()
        .max(255)
        .allow("", null),
    mime_type: Joi.string()
        .trim()
        .max(100)
        .allow("", null),
    file_size: Joi.number()
        .integer()
        .positive()
        .max(104857600)
        .allow(null)
        .messages({
            "number.base": "File size must be a number (in bytes)",
            "number.max": "File size cannot exceed 100 MB",
        }),
});

const propertyDocumentSchema = Joi.alternatives().try(
    singleDocumentItemSchema,
    Joi.array().items(singleDocumentItemSchema).min(1),
    Joi.object({
        documents: Joi.array().items(singleDocumentItemSchema).min(1).required().messages({
            "array.min": "At least one document must be provided",
            "any.required": "Documents list is required",
        }),
    })
);

const submitPropertySchema = Joi.object({
    status: Joi.string()
        .trim()
        .valid("submitted", "pending_review", "published")
        .default("submitted"),
    remarks: Joi.string().trim().max(1000).allow("", null),
});

const FACILITY_STATUSES = ["pending", "active", "inactive", "suspended"];

const facilityLoginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "Email must be a string",
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
});

const createFacilityCompanySchema = Joi.object({
    company_name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required()
        .messages({
            "string.base": "Company name must be a string",
            "string.empty": "Company name is required",
            "string.min": "Company name must be at least 2 characters",
            "string.max": "Company name cannot exceed 150 characters",
            "any.required": "Company name is required",
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "Email must be a string",
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),
    phone: Joi.string()
        .pattern(/^[0-9+ -]{7,20}$/)
        .required()
        .messages({
            "string.base": "Phone must be a string",
            "string.empty": "Phone is required",
            "string.pattern.base": "Phone must be a valid phone number (7-20 digits)",
            "any.required": "Phone is required",
        }),
    address: Joi.string()
        .trim()
        .max(1000)
        .allow("", null)
        .messages({
            "string.max": "Address cannot exceed 1000 characters",
        }),
    password: Joi.string()
        .min(6)
        .max(50)
        .allow("", null)
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 50 characters",
        }),
    status: Joi.string()
        .valid("active", "pending")
        .default("active")
        .messages({
            "any.only": "Status must be either active or pending",
        }),
});

const updateFacilityCompanySchema = Joi.object({
    company_name: Joi.string().trim().min(2).max(150),
    phone: Joi.string().pattern(/^[0-9+ -]{7,20}$/),
    address: Joi.string().trim().max(1000).allow("", null),
    status: Joi.string().valid(...FACILITY_STATUSES),
}).min(1).messages({
    "object.min": "At least one field must be provided for update",
});

const facilityIdParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Facility ID must be a number",
            "any.required": "Facility ID parameter is required",
        }),
});

module.exports = {
    userSchema,
    loginSchema,
    propertyIdParamSchema,
    propertyMediaParamSchema,
    propertyDocumentParamSchema,
    createPropertyBasicInfoSchema,
    updatePropertyBasicInfoSchema,
    propertyDetailSchema,
    propertyConfigurationSchema,
    propertyMediaSchema,
    propertyDocumentSchema,
    submitPropertySchema,
    facilityLoginSchema,
    createFacilityCompanySchema,
    updateFacilityCompanySchema,
    facilityIdParamSchema,
    FACILITY_STATUSES,
    PROPERTY_TYPES,
    LISTING_TYPES,
    AREA_UNITS,
    FURNISHING_STATUSES,
    PROPERTY_CONDITIONS,
    FACING_DIRECTIONS,
    OWNERSHIP_TYPES,
    POSSESSION_STATUSES,
    WATER_SUPPLY_TYPES,
    MEDIA_TYPES,
    DOCUMENT_TYPES,
};

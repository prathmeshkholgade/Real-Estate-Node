const {
    facilityLoginService,
    createFacilityCompanyByOwnerService,
    getAllFacilitiesService,
    getMyCreatedFacilitiesService,
    getFacilityByIdService,
    getFacilityProfileService,
    updateFacilityProfileService,
} = require("../services/facility_company_service");

const facilityLogin = async (req, res) => {
    const { email, password } = req.body;
    const result = await facilityLoginService(email, password);

    return res.status(200).json({
        success: true,
        message: "Facility management company logged in successfully",
        token: result.token,
        data: result.company,
    });
};

const createFacilityCompany = async (req, res) => {
    const result = await createFacilityCompanyByOwnerService(req.body, req.user.id);

    return res.status(201).json({
        success: true,
        message: "Facility management company created successfully. Login credentials generated.",
        data: result.company,
        credentials: result.credentials,
    });
};

const getAllFacilities = async (req, res) => {
    const result = await getAllFacilitiesService(req.query);

    return res.status(200).json({
        success: true,
        message: "Facility management companies retrieved successfully",
        data: result,
    });
};

const getMyCreatedFacilities = async (req, res) => {
    const result = await getMyCreatedFacilitiesService(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Your created facility management companies retrieved successfully",
        data: result,
    });
};

const getFacilityById = async (req, res) => {
    const company = await getFacilityByIdService(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Facility management company details retrieved successfully",
        data: company,
    });
};

const getFacilityProfile = async (req, res) => {
    const profile = await getFacilityProfileService(req.facility.id);

    return res.status(200).json({
        success: true,
        message: "Facility profile retrieved successfully",
        data: profile,
    });
};

const updateFacilityProfile = async (req, res) => {
    const updated = await updateFacilityProfileService(req.facility.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Facility profile updated successfully",
        data: updated,
    });
};

module.exports = {
    facilityLogin,
    createFacilityCompany,
    getAllFacilities,
    getMyCreatedFacilities,
    getFacilityById,
    getFacilityProfile,
    updateFacilityProfile,
};

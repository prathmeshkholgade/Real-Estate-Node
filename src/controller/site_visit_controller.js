const {
    bookSiteVisitService,
    getBuyerVisitsService,
    getSiteVisitByIdService,
    cancelSiteVisitService,
    getOwnerSiteVisitsService,
    updateSiteVisitStatusService,
} = require("../services/site_visit_service");

const bookSiteVisit = async (req, res) => {
    const visit = await bookSiteVisitService(req.user.id, req.body);

    return res.status(201).json({
        success: true,
        message: "Site visit booked successfully",
        data: visit,
    });
};

const getBuyerVisits = async (req, res) => {
    const result = await getBuyerVisitsService(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Your booked site visits retrieved successfully",
        data: result,
    });
};

const getSiteVisitById = async (req, res) => {
    const visit = await getSiteVisitByIdService(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Site visit details retrieved successfully",
        data: visit,
    });
};

const cancelSiteVisit = async (req, res) => {
    const visit = await cancelSiteVisitService(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Site visit cancelled successfully",
        data: visit,
    });
};

const getOwnerSiteVisits = async (req, res) => {
    const result = await getOwnerSiteVisitsService(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Site visit requests for your properties retrieved successfully",
        data: result,
    });
};

const updateSiteVisitStatus = async (req, res) => {
    const visit = await updateSiteVisitStatusService(
        req.params.id,
        req.user.id,
        req.body
    );

    return res.status(200).json({
        success: true,
        message: `Site visit status updated to ${visit.status} successfully`,
        data: visit,
    });
};

module.exports = {
    bookSiteVisit,
    getBuyerVisits,
    getSiteVisitById,
    cancelSiteVisit,
    getOwnerSiteVisits,
    updateSiteVisitStatus,
};


const siteVisitService = require("../services/site_visit_service");

const bookSiteVisit = async (req, res) => {
    const visit = await siteVisitService.bookSiteVisit(req.user.id, req.body);

    return res.status(201).json({
        success: true,
        message: "Site visit booked successfully",
        data: visit,
    });
};

const getBuyerVisits = async (req, res) => {
    const result = await siteVisitService.getBuyerVisits(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Your booked site visits retrieved successfully",
        data: result,
    });
};

const getSiteVisitById = async (req, res) => {
    const visit = await siteVisitService.getSiteVisitById(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Site visit details retrieved successfully",
        data: visit,
    });
};

const cancelSiteVisit = async (req, res) => {
    const visit = await siteVisitService.cancelSiteVisit(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Site visit cancelled successfully",
        data: visit,
    });
};

const getOwnerSiteVisits = async (req, res) => {
    const result = await siteVisitService.getOwnerSiteVisits(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Site visit requests for your properties retrieved successfully",
        data: result,
    });
};

const updateSiteVisitStatus = async (req, res) => {
    const visit = await siteVisitService.updateSiteVisitStatus(
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

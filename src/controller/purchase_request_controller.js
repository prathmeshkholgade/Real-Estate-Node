const {
    submitPurchaseRequestService,
    getBuyerPurchaseRequestsService,
    getOwnerPurchaseRequestsService,
    getPurchaseRequestByIdService,
    updatePurchaseRequestStatusService,
    recordPaymentService,
    processPaymentWebhookService,
    completePurchaseService,
    getPropertyOwnershipService,
} = require("../services/purchase_request_service");

const submitPurchaseRequest = async (req, res) => {
    const result = await submitPurchaseRequestService(req.user.id, req.body);

    return res.status(201).json({
        success: true,
        message: "Purchase request submitted successfully",
        data: result,
    });
};

const getBuyerPurchaseRequests = async (req, res) => {
    const result = await getBuyerPurchaseRequestsService(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Your purchase requests retrieved successfully",
        data: result,
    });
};

const getOwnerPurchaseRequests = async (req, res) => {
    const result = await getOwnerPurchaseRequestsService(req.user.id, req.query);

    return res.status(200).json({
        success: true,
        message: "Purchase requests for your properties retrieved successfully",
        data: result,
    });
};

const getPurchaseRequestById = async (req, res) => {
    const result = await getPurchaseRequestByIdService(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Purchase request details retrieved successfully",
        data: result,
    });
};

const updatePurchaseRequestStatus = async (req, res) => {
    const result = await updatePurchaseRequestStatusService(
        req.params.id,
        req.user.id,
        req.body
    );

    return res.status(200).json({
        success: true,
        message: `Purchase request status updated to ${req.body.status}`,
        data: result,
    });
};

const recordPayment = async (req, res) => {
    const result = await recordPaymentService(req.params.id, req.user.id, req.body);

    return res.status(201).json({
        success: true,
        message: "Payment processed and recorded successfully",
        data: result,
    });
};

const processPaymentWebhook = async (req, res) => {
    const result = await processPaymentWebhookService(req.body);

    return res.status(200).json({
        success: true,
        message: "Payment webhook event processed successfully",
        data: result,
    });
};

const completePurchase = async (req, res) => {
    const result = await completePurchaseService(req.params.id, req.user.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Purchase completed successfully. Ownership transferred.",
        data: result,
    });
};

const getPropertyOwnership = async (req, res) => {
    const result = await getPropertyOwnershipService(req.params.id, req.user.id);

    return res.status(200).json({
        success: true,
        message: "Property ownership details retrieved successfully",
        data: result,
    });
};

module.exports = {
    submitPurchaseRequest,
    getBuyerPurchaseRequests,
    getOwnerPurchaseRequests,
    getPurchaseRequestById,
    updatePurchaseRequestStatus,
    recordPayment,
    processPaymentWebhook,
    completePurchase,
    getPropertyOwnership,
};

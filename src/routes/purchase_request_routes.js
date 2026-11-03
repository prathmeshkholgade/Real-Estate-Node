const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const {
    verifyUser,
    verifyBuyer,
    verifyPropertyOwner,
} = require("../middleware/middleware");
const {
    submitPurchaseRequest,
    getBuyerPurchaseRequests,
    getOwnerPurchaseRequests,
    getPurchaseRequestById,
    updatePurchaseRequestStatus,
    recordPayment,
    completePurchase,
} = require("../controller/purchase_request_controller");
const {
    submitPurchaseRequestSchema,
    purchaseRequestIdParamSchema,
    updatePurchaseRequestStatusSchema,
    recordPaymentSchema,
    completePurchaseSchema,
} = require("../utils/validation");

router.post(
    "/",
    verifyUser,
    verifyBuyer,
    validate(submitPurchaseRequestSchema, "body"),
    asyncWrap(submitPurchaseRequest)
);

router.get(
    "/my-requests",
    verifyUser,
    verifyBuyer,
    asyncWrap(getBuyerPurchaseRequests)
);

router.get(
    "/owner",
    verifyUser,
    verifyPropertyOwner,
    asyncWrap(getOwnerPurchaseRequests)
);

router.get(
    "/:id",
    verifyUser,
    validate(purchaseRequestIdParamSchema, "params"),
    asyncWrap(getPurchaseRequestById)
);

router.patch(
    "/:id/status",
    verifyUser,
    verifyPropertyOwner,
    validate(purchaseRequestIdParamSchema, "params"),
    validate(updatePurchaseRequestStatusSchema, "body"),
    asyncWrap(updatePurchaseRequestStatus)
);

router.post(
    "/:id/payments",
    verifyUser,
    validate(purchaseRequestIdParamSchema, "params"),
    validate(recordPaymentSchema, "body"),
    asyncWrap(recordPayment)
);

router.post(
    "/:id/complete",
    verifyUser,
    validate(purchaseRequestIdParamSchema, "params"),
    validate(completePurchaseSchema, "body"),
    asyncWrap(completePurchase)
);

module.exports = router;


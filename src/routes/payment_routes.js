const express = require("express");
const router = express.Router();
const { asyncWrap } = require("../utils/async_wrap");
const validate = require("../middleware/validate");
const { processPaymentWebhook } = require("../controller/purchase_request_controller");
const { paymentWebhookSchema } = require("../utils/validation");

router.post(
    "/webhook",
    validate(paymentWebhookSchema, "body"),
    asyncWrap(processPaymentWebhook)
);

module.exports = router;


const BaseRepository = require("./base_repository");
const { PropertyPurchasePayment } = require("../models");

class PropertyPurchasePaymentRepository extends BaseRepository {
    constructor() {
        super(PropertyPurchasePayment);
    }

    async findSuccessfulPayments(purchaseRequestId) {
        return await this.findAll({
            where: {
                purchase_request_id: purchaseRequestId,
                status: "success",
            },
        });
    }

    async findByWebhookLookup(lookup) {
        const { payment_id, transaction_reference, gateway_payment_id, gateway_order_id } = lookup;

        if (payment_id) {
            const payment = await this.findById(payment_id);
            if (payment) return payment;
        }

        if (transaction_reference) {
            const payment = await this.findOne({ transaction_reference });
            if (payment) return payment;
        }

        if (gateway_payment_id) {
            const payment = await this.findOne({ gateway_payment_id });
            if (payment) return payment;
        }

        if (gateway_order_id) {
            const payment = await this.findOne({ gateway_order_id });
            if (payment) return payment;
        }

        return null;
    }
}

module.exports = new PropertyPurchasePaymentRepository();


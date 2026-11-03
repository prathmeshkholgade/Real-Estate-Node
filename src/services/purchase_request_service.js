const { Op, Sequelize } = require("sequelize");
const {
    PropertyPurchaseRequest,
    PropertyPurchasePayment,
    PropertyOwnership,
    Property,
    PropertySiteVisit,
    User,
    PropertyMedia,
    sequelize,
} = require("../models");
const ExpressError = require("../utils/express_error");

const submitPurchaseRequestService = async (buyerId, data) => {
    const { property_id, offered_price, message, site_visit_id } = data;

    const buyer = await User.findByPk(buyerId);
    if (!buyer) {
        throw new ExpressError(404, "Buyer user not found");
    }

    const property = await Property.findByPk(property_id);
    if (!property) {
        throw new ExpressError(404, "Property not found");
    }

    const allowedStatuses = ["published", "active"];
    const propertyStatus = property.status ? property.status.toLowerCase() : "";
    if (!allowedStatuses.includes(propertyStatus)) {
        throw new ExpressError(
            400,
            "Purchase requests can only be submitted for published and active properties"
        );
    }

    if (property.user_id === buyerId) {
        throw new ExpressError(
            400,
            "Property owners cannot submit a purchase request for their own property"
        );
    }

    let siteVisit;
    if (site_visit_id) {
        siteVisit = await PropertySiteVisit.findOne({
            where: {
                id: site_visit_id,
                property_id,
                user_id: buyerId,
            },
        });

        if (!siteVisit) {
            throw new ExpressError(
                400,
                "Specified site visit does not belong to this buyer and property"
            );
        }

        if (siteVisit.status !== "completed") {
            throw new ExpressError(
                400,
                `Only a buyer who has completed a site visit for that property can submit a purchase request (current visit status: ${siteVisit.status})`
            );
        }
    } else {
        siteVisit = await PropertySiteVisit.findOne({
            where: {
                property_id,
                user_id: buyerId,
                status: "completed",
            },
            order: [["createdAt", "DESC"]],
        });

        if (!siteVisit) {
            throw new ExpressError(
                400,
                "Only a buyer who has completed a site visit for that property can submit a purchase request"
            );
        }
    }

    const existingActiveRequest = await PropertyPurchaseRequest.findOne({
        where: {
            property_id,
            buyer_id: buyerId,
            status: ["pending", "accepted"],
        },
    });

    if (existingActiveRequest) {
        throw new ExpressError(
            400,
            `You already have an active purchase request (${existingActiveRequest.status}) for this property`
        );
    }

    const newRequest = await PropertyPurchaseRequest.create({
        property_id,
        buyer_id: buyerId,
        site_visit_id: siteVisit.id,
        offered_price,
        agreed_price: null,
        message: message || null,
        status: "pending",
    });

    return await PropertyPurchaseRequest.findByPk(newRequest.id, {
        include: [
            {
                model: Property,
                as: "property",
                attributes: ["id", "title", "price", "property_type", "listing_type", "status", "city", "address"],
            },
            {
                model: User,
                as: "buyer",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: PropertySiteVisit,
                as: "siteVisit",
                attributes: ["id", "preferred_date", "start_time", "end_time", "status"],
            },
        ],
    });
};



const getBuyerPurchaseRequestsService = async (buyerId, query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const where = { buyer_id: buyerId };
    if (query.status) {
        s
        where.status = query.status;
    }

    const { count, rows } = await PropertyPurchaseRequest.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Property,
                as: "property",
                attributes: ["id", "title", "price", "property_type", "listing_type", "status", "city", "address"],
                include: [
                    {
                        model: PropertyMedia,
                        as: "media",
                        attributes: ["id", "file_url", "media_type", "is_primary"],
                        required: false,
                    },
                ],
            },
            {
                model: PropertySiteVisit,
                as: "siteVisit",
                attributes: ["id", "preferred_date", "start_time", "end_time", "status"],
            },
            {
                model: PropertyPurchasePayment,
                as: "payments",
                attributes: ["id", "amount", "status", "paid_at", "transaction_reference", "payment_method"],
            },
            {
                model: PropertyOwnership,
                as: "ownership",
                attributes: ["id", "status", "acquired_at"],
            },
        ],
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const getOwnerPurchaseRequestsService = async (ownerId, query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const ownedProperties = await Property.findAll({
        where: { user_id: ownerId },
        attributes: ["id"],
    });

    const propertyIds = ownedProperties.map((p) => p.id);
    if (propertyIds.length === 0) {
        return {
            total: 0,
            page,
            limit,
            totalPages: 0,
            data: [],
        };
    }

    const where = {
        property_id: propertyIds,
    };

    if (query.property_id) {
        const propId = parseInt(query.property_id, 10);
        if (propertyIds.includes(propId)) {
            where.property_id = propId;
        } else {
            return {
                total: 0,
                page,
                limit,
                totalPages: 0,
                data: [],
            };
        }
    }

    if (query.status) {
        where.status = query.status;
    }

    const { count, rows } = await PropertyPurchaseRequest.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
            {
                model: Property,
                as: "property",
                attributes: ["id", "title", "price", "property_type", "listing_type", "status", "city", "address"],
            },
            {
                model: User,
                as: "buyer",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: PropertySiteVisit,
                as: "siteVisit",
                attributes: ["id", "preferred_date", "start_time", "end_time", "status"],
            },
            {
                model: PropertyPurchasePayment,
                as: "payments",
                attributes: ["id", "amount", "status", "paid_at", "transaction_reference", "payment_method"],
            },
            {
                model: PropertyOwnership,
                as: "ownership",
                attributes: ["id", "status", "acquired_at"],
            },
        ],
    });

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows,
    };
};

const getPurchaseRequestByIdService = async (requestId, userId) => {
    const request = await PropertyPurchaseRequest.findByPk(requestId, {
        include: [
            {
                model: Property,
                as: "property",
                attributes: ["id", "title", "price", "property_type", "listing_type", "status", "city", "address", "user_id"],
                include: [
                    {
                        model: PropertyMedia,
                        as: "media",
                        attributes: ["id", "file_url", "media_type", "is_primary"],
                        required: false,
                    },
                ],
            },
            {
                model: User,
                as: "buyer",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: User,
                as: "reviewer",
                attributes: ["id", "fullName", "email"],
            },
            {
                model: PropertySiteVisit,
                as: "siteVisit",
            },
            {
                model: PropertyPurchasePayment,
                as: "payments",
            },
            {
                model: PropertyOwnership,
                as: "ownership",
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Purchase request not found");
    }

    const isBuyer = request.buyer_id === userId;
    const isOwnerOrAgent = request.property && request.property.user_id === userId;

    if (!isBuyer && !isOwnerOrAgent) {
        throw new ExpressError(
            403,
            "You are not authorized to view this purchase request"
        );
    }

    return request;
};

const updatePurchaseRequestStatusService = async (requestId, reviewerId, data) => {
    const request = await PropertyPurchaseRequest.findByPk(requestId, {
        include: [
            {
                model: Property,
                as: "property",
            },
            {
                model: User,
                as: "buyer",
                attributes: ["id", "fullName", "email", "phone"],
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Purchase request not found");
    }

    if (!request.property || request.property.user_id !== reviewerId) {
        throw new ExpressError(
            403,
            "Only the current property owner or an authorized agent can accept/reject the request"
        );
    }

    if (request.status === "completed") {
        throw new ExpressError(400, "Completed purchase requests cannot be modified");
    }

    if (request.status === "cancelled") {
        throw new ExpressError(400, "Cancelled purchase requests cannot be modified");
    }

    if (request.status === data.status) {
        throw new ExpressError(400, `Purchase request is already ${data.status}`);
    }

    if (data.status === "accepted") {
        const existingAccepted = await PropertyPurchaseRequest.findOne({
            where: {
                property_id: request.property_id,
                status: "accepted",
                id: { [Op.ne]: requestId },
            },
        });

        if (existingAccepted) {
            throw new ExpressError(
                409,
                "A property should not have multiple accepted purchase requests simultaneously. Another request is already accepted."
            );
        }

        request.agreed_price = data.agreed_price ? Number(data.agreed_price) : Number(request.offered_price);
    }

    request.status = data.status;
    request.reviewed_by = reviewerId;
    request.reviewed_at = new Date();
    await request.save();

    return await PropertyPurchaseRequest.findByPk(requestId, {
        include: [
            {
                model: Property,
                as: "property",
            },
            {
                model: User,
                as: "buyer",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: User,
                as: "reviewer",
                attributes: ["id", "fullName", "email"],
            },
        ],
    });
};

const recordPaymentService = async (requestId, userId, data) => {
    const request = await PropertyPurchaseRequest.findByPk(requestId, {
        include: [
            {
                model: Property,
                as: "property",
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Purchase request not found");
    }

    const isBuyer = request.buyer_id === userId;
    const isOwner = request.property && request.property.user_id === userId;

    if (!isBuyer && !isOwner) {
        throw new ExpressError(
            403,
            "You are not authorized to make or record payments for this purchase request"
        );
    }

    if (request.status !== "accepted") {
        throw new ExpressError(
            400,
            `Payments can only be recorded for accepted purchase requests (current status: ${request.status})`
        );
    }

    const amount = data.amount
        ? parseFloat(data.amount)
        : parseFloat(request.agreed_price || request.offered_price || 0);

    if (amount <= 0) {
        throw new ExpressError(400, "Payment amount must be greater than 0");
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const txnRef = data.transaction_reference || `TXN_${Date.now()}_${randomSuffix}`;
    const orderId = `ORDER_${Date.now()}_${randomSuffix}`;
    const paymentId = `PAY_${Date.now()}_${randomSuffix}`;

    const payment = await PropertyPurchasePayment.create({
        purchase_request_id: request.id,
        amount,
        payment_method: data.payment_method || "card",
        transaction_reference: txnRef,
        gateway_order_id: orderId,
        gateway_payment_id: paymentId,
        status: "success",
        paid_at: new Date(),
    });

    return payment;
};

const processPaymentWebhookService = async (data) => {
    let payment = null;

    if (data.payment_id) {
        payment = await PropertyPurchasePayment.findByPk(data.payment_id);
    }

    if (!payment && data.transaction_reference) {
        payment = await PropertyPurchasePayment.findOne({
            where: { transaction_reference: data.transaction_reference },
        });
    }

    if (!payment && data.gateway_payment_id) {
        payment = await PropertyPurchasePayment.findOne({
            where: { gateway_payment_id: data.gateway_payment_id },
        });
    }

    if (!payment && data.gateway_order_id) {
        payment = await PropertyPurchasePayment.findOne({
            where: { gateway_order_id: data.gateway_order_id },
        });
    }

    if (!payment) {
        throw new ExpressError(404, "Payment record not found for webhook event");
    }

    let targetStatus = data.status;
    if (!targetStatus && data.event) {
        if (data.event.includes("fail")) targetStatus = "failed";
        else if (data.event.includes("refund")) targetStatus = "refunded";
        else targetStatus = "success";
    }

    payment.status = targetStatus || "success";
    if (payment.status === "success" && !payment.paid_at) {
        payment.paid_at = new Date();
    }
    if (data.gateway_payment_id) {
        payment.gateway_payment_id = data.gateway_payment_id;
    }

    await payment.save();

    return payment;
};

const completePurchaseService = async (requestId, userId, data) => {
    const request = await PropertyPurchaseRequest.findByPk(requestId, {
        include: [
            {
                model: Property,
                as: "property",
            },
            {
                model: User,
                as: "buyer",
            },
        ],
    });

    if (!request) {
        throw new ExpressError(404, "Purchase request not found");
    }

    const isOwner = request.property && request.property.user_id === userId;
    const isBuyer = request.buyer_id === userId;

    if (!isOwner && !isBuyer) {
        throw new ExpressError(
            403,
            "You are not authorized to complete this purchase request"
        );
    }

    if (request.status !== "accepted") {
        throw new ExpressError(
            400,
            `Cannot complete purchase request with status "${request.status}". Only accepted requests can be completed.`
        );
    }

    if (data && data.legal_verified === false) {
        throw new ExpressError(
            400,
            "Cannot complete purchase: Legal and document verification must be completed"
        );
    }

    const requiredPrice = parseFloat(request.agreed_price || request.offered_price || 0);

    const successfulPayments = await PropertyPurchasePayment.findAll({
        where: {
            purchase_request_id: request.id,
            status: "success",
        },
    });

    const totalPaid = successfulPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount || 0),
        0
    );

    if (totalPaid < requiredPrice) {
        throw new ExpressError(
            400,
            `Cannot complete purchase: Full payment has not been received. Required: ${requiredPrice.toFixed(2)}, Total paid: ${totalPaid.toFixed(2)}`
        );
    }

    const t = await sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    try {
        const now = new Date();

        const lockedProperty = await Property.findByPk(request.property_id, {
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!lockedProperty) {
            throw new ExpressError(404, "Property not found during completion transaction");
        }

        const activeOwnerships = await PropertyOwnership.findAll({
            where: {
                property_id: request.property_id,
                status: "active",
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        for (const ownership of activeOwnerships) {
            ownership.status = "inactive";
            ownership.released_at = now;
            await ownership.save({ transaction: t });
        }

        const newOwnership = await PropertyOwnership.create(
            {
                property_id: request.property_id,
                owner_id: request.buyer_id,
                purchase_request_id: request.id,
                status: "active",
                acquired_at: now,
                released_at: null,
            },
            { transaction: t }
        );

        lockedProperty.user_id = request.buyer_id;
        lockedProperty.status = "sold";
        await lockedProperty.save({ transaction: t });

        request.status = "completed";
        request.completed_at = now;
        await request.save({ transaction: t });

        await t.commit();

        return {
            purchase_request: request,
            ownership: newOwnership,
            property: lockedProperty,
            total_paid: totalPaid,
            legal_verified: true,
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getPropertyOwnershipService = async (propertyId) => {
    const property = await Property.findByPk(propertyId, {
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["id", "fullName", "email", "phone"],
            },
        ],
    });

    if (!property) {
        throw new ExpressError(404, "Property not found");
    }

    const activeOwnership = await PropertyOwnership.findOne({
        where: {
            property_id: propertyId,
            status: "active",
        },
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: PropertyPurchaseRequest,
                as: "purchaseRequest",
                attributes: ["id", "agreed_price", "offered_price", "completed_at", "status"],
            },
        ],
    });

    const ownershipHistory = await PropertyOwnership.findAll({
        where: {
            property_id: propertyId,
            status: "inactive",
        },
        order: [
            ["acquired_at", "DESC"],
            ["createdAt", "DESC"],
        ],
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["id", "fullName", "email", "phone"],
            },
            {
                model: PropertyPurchaseRequest,
                as: "purchaseRequest",
                attributes: ["id", "agreed_price", "offered_price", "completed_at", "status"],
            },
        ],
    });

    const currentOwnership = activeOwnership || {
        property_id: property.id,
        owner_id: property.user_id,
        status: "active",
        owner: property.owner,
        acquired_at: property.createdAt,
        released_at: null,
        is_initial_owner: true,
    };

    return {
        property: {
            id: property.id,
            title: property.title,
            address: property.address,
            city: property.city,
            price: property.price,
            status: property.status,
        },
        currentOwnership,
        history: ownershipHistory,
    };
};



module.exports = {
    submitPurchaseRequestService,
    getBuyerPurchaseRequestsService,
    getOwnerPurchaseRequestsService,
    getPurchaseRequestByIdService,
    updatePurchaseRequestStatusService,
    recordPaymentService,
    processPaymentWebhookService,
    completePurchaseService,
    getPropertyOwnershipService,
};





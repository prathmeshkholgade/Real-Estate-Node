const { Sequelize } = require("sequelize");
const { sequelize } = require("../models");
const purchaseRequestRepository = require("../repositories/purchase_request_repository");
const propertyPurchasePaymentRepository = require("../repositories/property_purchase_payment_repository");
const propertyOwnershipRepository = require("../repositories/property_ownership_repository");
const propertyRepository = require("../repositories/property_repository");
const siteVisitRepository = require("../repositories/site_visit_repository");
const authRepository = require("../repositories/auth_repository");
const ExpressError = require("../utils/express_error");

class PurchaseRequestService {
    async submitPurchaseRequest(buyerId, data) {
        const { property_id, offered_price, message, site_visit_id } = data;

        const buyer = await authRepository.findById(buyerId);
        if (!buyer) {
            throw new ExpressError(404, "Buyer user not found");
        }

        const property = await propertyRepository.findById(property_id);
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

        let verifiedSiteVisit = null;

        if (site_visit_id) {
            verifiedSiteVisit = await siteVisitRepository.findOne({
                id: site_visit_id,
                property_id,
                user_id: buyerId,
                status: "completed",
            });

            if (!verifiedSiteVisit) {
                throw new ExpressError(
                    400,
                    "Provided site visit does not belong to you, is for a different property, or is not completed"
                );
            }
        } else {
            verifiedSiteVisit = await siteVisitRepository.findOne(
                {
                    property_id,
                    user_id: buyerId,
                    status: "completed",
                },
                {
                    order: [["updatedAt", "DESC"]],
                }
            );

            if (!verifiedSiteVisit) {
                throw new ExpressError(
                    403,
                    "Only a buyer who has completed a site visit for this property can submit a purchase request"
                );
            }
        }

        const existingPending = await purchaseRequestRepository.findOne({
            property_id,
            buyer_id: buyerId,
            status: "pending",
        });

        if (existingPending) {
            throw new ExpressError(
                409,
                "You already have a pending purchase request for this property"
            );
        }

        const existingAccepted = await purchaseRequestRepository.findActiveAcceptedRequest(property_id);
        if (existingAccepted) {
            throw new ExpressError(
                409,
                "This property already has an accepted purchase request under negotiation"
            );
        }

        const purchaseRequest = await purchaseRequestRepository.create({
            property_id,
            buyer_id: buyerId,
            site_visit_id: verifiedSiteVisit.id,
            offered_price,
            agreed_price: null,
            message: message || null,
            status: "pending",
        });

        const createdRequest = await purchaseRequestRepository.findRequestWithAllDetails(purchaseRequest.id);

        return createdRequest;
    }

    async getBuyerPurchaseRequests(buyerId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const result = await purchaseRequestRepository.findBuyerRequests(buyerId, {
            limit,
            offset,
            status: query.status,
        });

        return {
            purchase_requests: result.rows,
            pagination: {
                totalRecords: result.count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    async getOwnerPurchaseRequests(ownerId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const propertyWhere = { user_id: ownerId };
        if (query.property_id) {
            propertyWhere.id = query.property_id;
        }

        const ownedProperties = await propertyRepository.findAll({
            where: propertyWhere,
            attributes: ["id"],
        });

        const ownedPropertyIds = ownedProperties.map((p) => p.id);
        if (ownedPropertyIds.length === 0) {
            return {
                purchase_requests: [],
                pagination: {
                    totalRecords: 0,
                    currentPage: page,
                    limit,
                    totalPages: 0,
                },
            };
        }

        const result = await purchaseRequestRepository.findOwnerRequests(ownedPropertyIds, {
            limit,
            offset,
            status: query.status,
        });

        return {
            purchase_requests: result.rows,
            pagination: {
                totalRecords: result.count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    async getPurchaseRequestById(requestId, userId) {
        const request = await purchaseRequestRepository.findRequestWithAllDetails(requestId);

        if (!request) {
            throw new ExpressError(404, "Purchase request not found");
        }

        const isBuyer = request.buyer_id === userId;
        const isOwner = request.property && request.property.user_id === userId;

        if (!isBuyer && !isOwner) {
            throw new ExpressError(
                403,
                "You are not authorized to view this purchase request"
            );
        }

        return request;
    }

    async updatePurchaseRequestStatus(requestId, reviewerId, data) {
        const { status, agreed_price } = data;

        const request = await purchaseRequestRepository.findRequestWithProperty(requestId);

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
            throw new ExpressError(
                400,
                "Cannot change status of an already completed purchase request"
            );
        }

        if (status === "accepted") {
            const existingAccepted = await purchaseRequestRepository.findActiveAcceptedRequest(
                request.property_id,
                request.id
            );

            if (existingAccepted) {
                throw new ExpressError(
                    409,
                    "A property cannot have multiple accepted purchase requests simultaneously"
                );
            }

            const finalPrice = agreed_price ? parseFloat(agreed_price) : parseFloat(request.offered_price);

            await request.update({
                status: "accepted",
                agreed_price: finalPrice,
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        } else if (status === "rejected") {
            await request.update({
                status: "rejected",
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        }

        const updatedRequest = await purchaseRequestRepository.findRequestWithAllDetails(request.id);

        return updatedRequest;
    }

    async recordPayment(requestId, userId, data) {
        const request = await purchaseRequestRepository.findRequestWithProperty(requestId);

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

        const payment = await propertyPurchasePaymentRepository.create({
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
    }

    async processPaymentWebhook(data) {
        const payment = await propertyPurchasePaymentRepository.findByWebhookLookup(data);

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
    }

    async completePurchase(requestId, userId, data) {
        const request = await purchaseRequestRepository.findRequestWithBuyerAndProperty(requestId);

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

        const successfulPayments = await propertyPurchasePaymentRepository.findSuccessfulPayments(request.id);

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

            const lockedProperty = await propertyRepository.findById(request.property_id, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!lockedProperty) {
                throw new ExpressError(404, "Property not found during completion transaction");
            }

            const activeOwnerships = await propertyOwnershipRepository.findActiveOwnerships(request.property_id, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            for (const ownership of activeOwnerships) {
                ownership.status = "inactive";
                ownership.released_at = now;
                await ownership.save({ transaction: t });
            }

            const newOwnership = await propertyOwnershipRepository.create(
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
    }

    async getPropertyOwnership(propertyId) {
        const property = await propertyRepository.findById(propertyId, {
            include: [
                {
                    model: authRepository.model,
                    as: "owner",
                    attributes: ["id", "fullName", "email", "phone"],
                },
            ],
        });

        if (!property) {
            throw new ExpressError(404, "Property not found");
        }

        const activeOwnership = await propertyOwnershipRepository.findActiveOwnership(propertyId);
        const ownershipHistory = await propertyOwnershipRepository.findOwnershipHistory(propertyId);

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
    }
}

const purchaseRequestService = new PurchaseRequestService();

purchaseRequestService.submitPurchaseRequestService = purchaseRequestService.submitPurchaseRequest.bind(purchaseRequestService);
purchaseRequestService.getBuyerPurchaseRequestsService = purchaseRequestService.getBuyerPurchaseRequests.bind(purchaseRequestService);
purchaseRequestService.getOwnerPurchaseRequestsService = purchaseRequestService.getOwnerPurchaseRequests.bind(purchaseRequestService);
purchaseRequestService.getPurchaseRequestByIdService = purchaseRequestService.getPurchaseRequestById.bind(purchaseRequestService);
purchaseRequestService.updatePurchaseRequestStatusService = purchaseRequestService.updatePurchaseRequestStatus.bind(purchaseRequestService);
purchaseRequestService.recordPaymentService = purchaseRequestService.recordPayment.bind(purchaseRequestService);
purchaseRequestService.processPaymentWebhookService = purchaseRequestService.processPaymentWebhook.bind(purchaseRequestService);
purchaseRequestService.completePurchaseService = purchaseRequestService.completePurchase.bind(purchaseRequestService);
purchaseRequestService.getPropertyOwnershipService = purchaseRequestService.getPropertyOwnership.bind(purchaseRequestService);

module.exports = purchaseRequestService;

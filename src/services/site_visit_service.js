const siteVisitRepository = require("../repositories/site_visit_repository");
const propertyRepository = require("../repositories/property_repository");
const authRepository = require("../repositories/auth_repository");
const ExpressError = require("../utils/express_error");

const normalizeTime = (t) => {
    if (!t) return t;
    const parts = t.split(":");
    if (parts.length === 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
};

class SiteVisitService {
    async bookSiteVisit(buyerId, data) {
        const {
            property_id,
            preferred_date,
            start_time,
            end_time,
            message,
            phone_number,
            full_name,
            email,
        } = data;

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
                "Site visits can only be booked for published and active properties"
            );
        }

        if (property.user_id === buyerId) {
            throw new ExpressError(
                400,
                "Property owners cannot book a site visit for their own property"
            );
        }

        const todayStr = new Date().toISOString().split("T")[0];
        if (preferred_date < todayStr) {
            throw new ExpressError(400, "Preferred visit date cannot be in the past");
        }

        const normStartTime = normalizeTime(start_time);
        const normEndTime = normalizeTime(end_time);

        if (normStartTime >= normEndTime) {
            throw new ExpressError(400, "End time must be after start time");
        }

        const overlappingConfirmed = await siteVisitRepository.findOverlappingConfirmed(
            property_id,
            preferred_date,
            normStartTime,
            normEndTime
        );

        if (overlappingConfirmed) {
            throw new ExpressError(
                409,
                "A confirmed visit already exists for this property during the requested time slot"
            );
        }

        const snapshotFullName = full_name && full_name.trim() ? full_name.trim() : buyer.fullName;
        const snapshotEmail = email && email.trim() ? email.trim() : buyer.email;
        const snapshotPhone = phone_number && phone_number.trim() ? phone_number.trim() : buyer.phone;

        const siteVisit = await siteVisitRepository.create({
            property_id,
            user_id: buyerId,
            full_name: snapshotFullName,
            email: snapshotEmail,
            phone_number: snapshotPhone,
            preferred_date,
            start_time: normStartTime,
            end_time: normEndTime,
            message: message || null,
            status: "pending",
        });

        const createdVisit = await siteVisitRepository.findVisitWithProperty(siteVisit.id);

        return createdVisit;
    }

    async getBuyerVisits(buyerId, query = {}) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
        const offset = (page - 1) * limit;

        const result = await siteVisitRepository.findBuyerVisits(buyerId, {
            limit,
            offset,
            status: query.status,
        });

        return {
            site_visits: result.rows,
            pagination: {
                totalRecords: result.count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    async getSiteVisitById(visitId, userId) {
        const visit = await siteVisitRepository.findVisitWithAllDetails(visitId);

        if (!visit) {
            throw new ExpressError(404, "Site visit not found");
        }

        const isBuyer = visit.user_id === userId;
        const isOwnerOrAgent = visit.property && visit.property.user_id === userId;

        if (!isBuyer && !isOwnerOrAgent) {
            throw new ExpressError(403, "You are not authorized to view this site visit");
        }

        return visit;
    }

    async cancelSiteVisit(visitId, userId) {
        const visit = await siteVisitRepository.findVisitWithProperty(visitId);

        if (!visit) {
            throw new ExpressError(404, "Site visit not found");
        }

        const isBuyer = visit.user_id === userId;
        const isOwner = visit.property && visit.property.user_id === userId;

        if (!isBuyer && !isOwner) {
            throw new ExpressError(403, "You are not authorized to cancel this site visit");
        }

        if (visit.status === "cancelled") {
            throw new ExpressError(400, "Site visit is already cancelled");
        }

        if (visit.status === "completed") {
            throw new ExpressError(400, "Cannot cancel a completed site visit");
        }

        if (visit.status === "rejected") {
            throw new ExpressError(400, "Cannot cancel an already rejected site visit");
        }

        await visit.update({ status: "cancelled" });

        return visit;
    }

    async getOwnerSiteVisits(ownerId, query = {}) {
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
                site_visits: [],
                pagination: {
                    totalRecords: 0,
                    currentPage: page,
                    limit,
                    totalPages: 0,
                },
            };
        }

        const result = await siteVisitRepository.findOwnerVisits(ownedPropertyIds, {
            limit,
            offset,
            status: query.status,
            date: query.date,
        });

        return {
            site_visits: result.rows,
            pagination: {
                totalRecords: result.count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(result.count / limit),
            },
        };
    }

    async updateSiteVisitStatus(visitId, reviewerId, data) {
        const { status, scheduled_date, scheduled_start_time, scheduled_end_time } = data;

        const visit = await siteVisitRepository.findVisitWithProperty(visitId);

        if (!visit) {
            throw new ExpressError(404, "Site visit not found");
        }

        if (!visit.property || visit.property.user_id !== reviewerId) {
            throw new ExpressError(
                403,
                "Only the property's owner or assigned agent can manage visit requests"
            );
        }

        if (visit.status === "cancelled") {
            throw new ExpressError(400, "Cannot update status of a cancelled site visit");
        }

        if (visit.status === "completed") {
            throw new ExpressError(400, "Site visit has already been completed");
        }

        if (status === "confirmed") {
            const targetDate = scheduled_date || visit.scheduled_date || visit.preferred_date;
            const targetStart = normalizeTime(
                scheduled_start_time || visit.scheduled_start_time || visit.start_time
            );
            const targetEnd = normalizeTime(
                scheduled_end_time || visit.scheduled_end_time || visit.end_time
            );

            if (targetStart >= targetEnd) {
                throw new ExpressError(400, "Scheduled end time must be after start time");
            }

            const overlap = await siteVisitRepository.findOverlappingConfirmed(
                visit.property_id,
                targetDate,
                targetStart,
                targetEnd,
                visit.id
            );

            if (overlap) {
                throw new ExpressError(
                    409,
                    "Cannot confirm visit: an overlapping confirmed visit already exists for this property and time slot"
                );
            }

            await visit.update({
                status: "confirmed",
                scheduled_date: targetDate,
                scheduled_start_time: targetStart,
                scheduled_end_time: targetEnd,
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        } else if (status === "completed") {
            if (visit.status !== "confirmed") {
                throw new ExpressError(400, "Only confirmed visits can be marked as completed");
            }

            await visit.update({
                status: "completed",
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        } else if (status === "rejected") {
            await visit.update({
                status: "rejected",
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        } else if (status === "cancelled") {
            await visit.update({
                status: "cancelled",
                reviewed_by: reviewerId,
                reviewed_at: new Date(),
            });
        }

        const updatedVisit = await siteVisitRepository.findVisitWithAllDetails(visit.id);

        return updatedVisit;
    }
}

const siteVisitService = new SiteVisitService();

siteVisitService.bookSiteVisitService = siteVisitService.bookSiteVisit.bind(siteVisitService);
siteVisitService.getBuyerVisitsService = siteVisitService.getBuyerVisits.bind(siteVisitService);
siteVisitService.getSiteVisitByIdService = siteVisitService.getSiteVisitById.bind(siteVisitService);
siteVisitService.cancelSiteVisitService = siteVisitService.cancelSiteVisit.bind(siteVisitService);
siteVisitService.getOwnerSiteVisitsService = siteVisitService.getOwnerSiteVisits.bind(siteVisitService);
siteVisitService.updateSiteVisitStatusService = siteVisitService.updateSiteVisitStatus.bind(siteVisitService);

module.exports = siteVisitService;

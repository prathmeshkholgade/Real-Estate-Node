const BaseRepository = require("./base_repository");
const { TechnicianTaskMedia, User } = require("../models");

class TechnicianTaskMediaRepository extends BaseRepository {
    constructor() {
        super(TechnicianTaskMedia);
    }

    async findByTaskId(taskId, stage = null) {
        const where = { technician_task_id: taskId };
        if (stage) {
            where.stage = stage;
        }

        return await this.findAll({
            where,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "uploadedBy",
                    attributes: ["id", "fullName"],
                },
            ],
        });
    }
}

module.exports = new TechnicianTaskMediaRepository();

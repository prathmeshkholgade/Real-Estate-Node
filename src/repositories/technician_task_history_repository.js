const BaseRepository = require("./base_repository");
const { TechnicianTaskHistory, User } = require("../models");

class TechnicianTaskHistoryRepository extends BaseRepository {
    constructor() {
        super(TechnicianTaskHistory);
    }

    async findByTaskId(taskId) {
        return await this.findAll({
            where: { technician_task_id: taskId },
            order: [["createdAt", "ASC"]],
            include: [
                {
                    model: User,
                    as: "changedBy",
                    attributes: ["id", "fullName", "email"],
                },
            ],
        });
    }
}

module.exports = new TechnicianTaskHistoryRepository();

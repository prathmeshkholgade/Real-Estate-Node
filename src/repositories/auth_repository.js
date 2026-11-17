const BaseRepository = require("./base_repository");
const { User } = require("../models");

class AuthRepository extends BaseRepository {
    constructor() {
        super(User)
    };


    async findByEmail(email) {
        return await this.model.findOne({
            where: { email }
        });
    }

    async findByPhone(phone) {
        return await this.model.findOne({
            where: { phone }
        });
    }

}
module.exports = new AuthRepository();
































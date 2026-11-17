class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data, options = {}) {
        return await this.model.create(data, options);
    }

    async bulkCreate(records, options = {}) {
        return await this.model.bulkCreate(records, options);
    }

    async findById(id, options = {}) {
        return await this.model.findByPk(id, options);
    }

    async findOne(where, options = {}) {
        return await this.model.findOne({
            where,
            ...options
        });
    }

    async findAll(options = {}) {
        return await this.model.findAll(options);
    }

    async findAndCountAll(options = {}) {
        return await this.model.findAndCountAll(options);
    }

    async update(id, data, options = {}) {
        const record = await this.findById(id, options);

        if (!record) {
            return null;
        }

        return await record.update(data, options);
    }

    async delete(id, options = {}) {
        const record = await this.findById(id, options);

        if (!record) {
            return null;
        }

        await record.destroy(options);

        return record;
    }

    async count(options = {}) {
        return await this.model.count(options);
    }
}

module.exports = BaseRepository;

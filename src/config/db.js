
const db = require("../models");

const connectToDb = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("connected to db");
    } catch (e) {
        console.log(`DB Error ${e}`);
    }
}
connectToDb();
module.exports = connectToDb;
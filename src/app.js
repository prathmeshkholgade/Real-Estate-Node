const express = require("express");
const app = express();
const db = require("./config/db");
const router = require("./routes/index");
const { globalErrorHanlder } = require("./utils/global_error_handler");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
}));

app.use(router);



app.use(globalErrorHanlder);
module.exports = app;










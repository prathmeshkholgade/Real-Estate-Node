const express = require("express");
const app = express();
const db = require("./config/db");
const router = require("./routes/index");
const { globalErrorHanlder } = require("./utils/global_error_handler");

app.use(express.json());

app.use(router);



app.use(globalErrorHanlder);
module.exports = app;










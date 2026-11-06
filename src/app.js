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



app.get("/cicd", (req, res) => {
    res.send("ci/cd pipline is working");
});


app.get("/", (req, res) => {
    res.send("working");
});

app.use(router);



app.use(globalErrorHanlder);
module.exports = app;










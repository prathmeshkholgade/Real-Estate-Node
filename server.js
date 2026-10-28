
require("dotenv").config();
const app = require("./src/app.js");


const port = 8080;
app.listen(port, () => {
    console.log(`server is listing to ${port}`);
})


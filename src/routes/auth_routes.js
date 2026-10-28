
const express = require("express");
const router = express.Router();
const { createUser, logIn } = require("../controller/auth_controller");
const validate = require("../middleware/validate");
const { asyncWrap } = require("../utils/async_wrap");
const { userSchema, loginSchema } = require("../utils/validation");


router.post("/create-user", validate(userSchema), asyncWrap(createUser));
router.post("/login", validate(loginSchema), asyncWrap(logIn));



module.exports = router;









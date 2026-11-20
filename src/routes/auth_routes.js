
const express = require("express");
const router = express.Router();
const { createUser, logIn, getUserProfile } = require("../controller/auth_controller");
const validate = require("../middleware/validate");
const { asyncWrap } = require("../utils/async_wrap");
const { userSchema, loginSchema } = require("../utils/validation");
const { verifyUser } = require("../middleware/middleware");


router.post("/create-user", validate(userSchema), asyncWrap(createUser));
router.post("/login", validate(loginSchema), asyncWrap(logIn));
router.get("/user", verifyUser, asyncWrap(getUserProfile));




module.exports = router;









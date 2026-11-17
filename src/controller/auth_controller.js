const authService = require("../services/auth_service");

const createUser = async (req, res, next) => {
    const user = await authService.createUser(req.body);

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user
    });

};

const logIn = async (req, res, next) => {
    const result = await authService.logIn(req.body);
    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        ...result
    });
};

module.exports = { createUser, logIn };
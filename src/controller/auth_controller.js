const { User } = require("../models/index");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/helper");
const role = require("../models/role");

const createUser = async (req, res) => {
    const { fullName, email, phone, password, role_id } = req.body;

    const isExist = await User.findOne({
        where: { email }
    });

    if (isExist) {
        return res.status(409).json({
            message: "User already exists with this email",
            statusCode: 409,
            success: false
        });
    }

    const isPhoneExist = await User.findOne({
        where: { phone }
    });

    if (isPhoneExist) {
        return res.status(409).json({
            message: "User already exists with this phone number",
            statusCode: 409,
            success: false
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        phone,
        role_id: role_id,
        password: hashedPassword
    });
    const token = generateToken(user.id);
    return res.status(201).json({
        message: "User created successfully",
        statusCode: 201,
        success: true,
        data: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            token
        }
    });
};

const logIn = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        where: { email },
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Invalid email or password",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Invalid email or password",
        });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User logged in successfully",
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role_id
        },
    });
};




module.exports = { createUser, logIn };


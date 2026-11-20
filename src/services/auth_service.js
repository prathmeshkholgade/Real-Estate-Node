
const authRepository = require("../repositories/auth_repository");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/helper");
const ExpressError = require("../utils/express_error");

class AuthService {

    async createUser(data) {
        const { fullName, email, phone, password, role_id } = data;

        const isEmailExist = await authRepository.findByEmail(email);

        if (isEmailExist) {
            throw new ExpressError(
                409,
                "User already exists with this email"
            );
        }

        const isPhoneExist = await authRepository.findByPhone(phone);

        if (isPhoneExist) {
            throw new ExpressError(
                409,
                "User already exists with this phone number"
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await authRepository.create({
            fullName,
            email,
            phone,
            role_id,
            password: hashedPassword
        });

        const token = generateToken(user.id);

        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            token
        };
    }

    async logIn(data) {
        const { email, password } = data;

        const user = await authRepository.findByEmail(email);

        if (!user) {
            throw new ExpressError(
                401,
                "Invalid email or password"
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            throw new ExpressError(
                401,
                "Invalid email or password"
            );
        }

        const token = generateToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role_id
            }
        };
    }

    async getUserProfile(id) {
        const user = await authRepository.findById(id, {
            attributes: {
                exclude: ["password", "updatedAt", "createdAt"]
            }
        });
        if (!user) {
            return ExpressError(400, "user not found");
        }
        return user.toJSON();
    }
}

module.exports = new AuthService();

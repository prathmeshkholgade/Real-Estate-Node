const jwt = require("jsonwebtoken");
const verifyUser = (req, res, next) => {
    try {
        let token = req.cookies?.token || req.headers.authorization;

        if (token && token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        console.log(req.user);
        next();
    } catch (error) {
        next(error)
    }
};

module.exports = { verifyUser };
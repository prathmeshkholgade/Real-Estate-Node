module.exports.globalErrorHanlder = (err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || "Something went wrong";
    const stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

    return res.status(status).json({
        success: false,
        statusCode: status,
        message,
        stack,
    });
};

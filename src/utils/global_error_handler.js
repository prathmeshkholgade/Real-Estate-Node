module.exports.globalErrorHanlder = (err, req, res, next) => {
    const { status = 500, message = "something went wrong", stack } = err;
    res.json({ status, message, stack })
}
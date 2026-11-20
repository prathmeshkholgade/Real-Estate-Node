const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                // errors: error.details.map((detail) => ({
                //     field: detail.path.join("."),
                //     message: detail.message,
                // })),
            });
        }

        req[source] = value;
        next();
    };
};

module.exports = validate;

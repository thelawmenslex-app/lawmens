const options = {
    abortEarly: false,
};
//validation function for validating reqdata with schema
const validate = (schema) => async (req, res, next) => {
    const { error } = await schema.validate(req, options);
    if (error) {
        res.status(422).json({
            status: false,
            statusCode: 422,
            message: '' + error.message,
        });
    } else {
        return next();
    }
};

const bulkValidation = (schema, data) => {
    return schema.validate(data)
}
module.exports = { validate, bulkValidation };

const joi = require('joi');
//add end use schema
const addCategory = joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required()
        }),
    })
    .unknown(true);
module.exports = { addCategory };

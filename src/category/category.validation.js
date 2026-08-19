const joi = require('joi');
//add end use schema
const addCategory = joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required(),
            image: joi.string().strict().trim().optional(),
            type: joi.string().strict().valid("old", "new").required(),
        }),
    })
    .unknown(true);
module.exports = { addCategory };

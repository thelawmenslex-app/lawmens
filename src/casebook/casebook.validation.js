const joi = require('joi');
//add end use schema
const addCategory = joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required(),
            categoryId: joi.string().strict().trim().required()
        }),
    })
    .unknown(true);
const addSection = joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required(),
            oldversion: joi.string().strict().trim().optional(),
            content:joi.array().optional(),
            keyword:joi.string().strict().trim().optional(),
        }),
    })
    .unknown(true);
    const addSubsection=joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required(),
            sectionId: joi.string().strict().trim().required(),
        }),
    })
    .unknown(true);
    
    const addUndersection=joi
    .object({
        body: joi.object({
            name: joi.string().strict().trim().required(),
        }),
    })
    .unknown(true);
    
    const addContent=joi
    .object({
        body: joi.object({
            content: joi.string().strict().trim().required(),
            page:joi.number().required()
        }),
    })
    .unknown(true);
module.exports = { addCategory, addSection ,addSubsection,addUndersection,addContent};

const joi = require('joi');

// Validation schema for adding a new legal entry
const addLegalEntry = joi.object({
    body: joi.object({
        section: joi.number().required(),
        offence: joi.string().strict().trim().required(),
        punishment: joi.string().strict().trim().required(),
        cognizable: joi.string().strict().trim().required(),
        bailable: joi.string().strict().trim().required(),
        court: joi.string().strict().trim().required(),
    }),
}).unknown(true);

// Validation schema for updating a legal entry
const updateLegalEntry = joi.object({
    body: joi.object({
        section: joi.number().optional(),
        offence: joi.string().strict().trim().optional(),
        punishment: joi.string().strict().trim().optional(),
        cognizable: joi.string().strict().trim().optional(),
        bailable: joi.string().strict().trim().optional(),
        court: joi.string().strict().trim().optional(),
    }),
}).unknown(true);

// Validation schema for adding a new section
const addSection = joi.object({
    body: joi.object({
        name: joi.string().strict().trim().required(),
        oldversion: joi.string().strict().trim().optional(),
        content: joi.array().optional(),
        keyword: joi.string().strict().trim().optional(),
    }),
}).unknown(true);

// Validation schema for adding a subsection
const addSubsection = joi.object({
    body: joi.object({
        name: joi.string().strict().trim().required(),
        sectionId: joi.string().strict().trim().required(),
    }),
}).unknown(true);

// Validation schema for adding content under a section or subsection
const addContent = joi.object({
    body: joi.object({
        content: joi.string().strict().trim().required(),
        page: joi.number().required(),
    }),
}).unknown(true);

module.exports = {
    addLegalEntry,
    updateLegalEntry,
    addSection,
    addSubsection,
    addContent,
};

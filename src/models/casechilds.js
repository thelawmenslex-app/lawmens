const { Schema, model } = require('mongoose');
const { CASECHILD } = require('../../utils/constants');
const caseChildSchema = Schema(
    {
        sectionId: { type: String },
        name: { type: String },
        underSection: [{
            name: { type: String },
            content: [{ content: { type: String }, page: { type: Number } }]
        }],
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(CASECHILD, caseChildSchema);

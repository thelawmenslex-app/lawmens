const { Schema, model } = require('mongoose');
const { PROFESSION } = require('../../utils/constants');
const categorySchema = Schema(
    {
        name: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(PROFESSION, categorySchema);

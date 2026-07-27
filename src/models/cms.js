const { Schema, model } = require('mongoose');
const { cms } = require('../../utils/constants');
const categorySchema = Schema(
    {
        type: { type: String },
        content: { type: String ,default:"No content"},
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(cms, categorySchema);

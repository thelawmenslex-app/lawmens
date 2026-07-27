const { Schema, model } = require('mongoose');
const { CATEGORY } = require('../../utils/constants');
const categorySchema = Schema(
    {
        name: { type: String },
        image: { type: String },
        type: { type: String, enum: ["old", "new"] },
        parentId: { type: String },
        act: { type: String, default: "No content available" },
        isActive: { type: Boolean, default: true },
        firstScheduleHtml: { type: String },
        secondScheduleHtml: { type: String },
        firstSchedulePdfUrl: { type: String },
        secondSchedulePdfUrl: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(CATEGORY, categorySchema);

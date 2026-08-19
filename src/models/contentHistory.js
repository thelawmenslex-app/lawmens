const { Schema, model } = require('mongoose');
const { USER, CONTENTHISTORY } = require('../../utils/constants');
const category = require('./category');
const contentHistory = Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: USER,
        },
        chapterId: { type: String },
        sectionId: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(CONTENTHISTORY, contentHistory);

const { Schema, model } = require('mongoose');
const { SUBSCRIPTIONHISTORY, USER } = require('../../utils/constants');
const category = require('./category');
const casebookSchema = Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: USER,
        },
        plan: { type: Object },
        purchasedDate: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(SUBSCRIPTIONHISTORY, casebookSchema);

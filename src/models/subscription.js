const { Schema, model } = require('mongoose');
const { SUBSCRIPTION } = require('../../utils/constants');
const categorySchema = Schema(
    {
        name: { type: String },
        validity:{type:Number},
        count:{type:Number},
        price:{type:Number},
        discount:{type:Number},
        description:{type:String},
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(SUBSCRIPTION, categorySchema);

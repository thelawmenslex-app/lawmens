const { Schema, model } = require('mongoose');
const { SETTING } = require('../../utils/constants');
const categorySchema = Schema(
    {
        email: { type: String , default:"admin@yopmail.com"},
        phoneNumber: { type: String ,default:"9876543210"},
        trialDays: { type: Number, default: 10 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(SETTING, categorySchema);

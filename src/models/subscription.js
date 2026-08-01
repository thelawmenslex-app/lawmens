const { Schema, model } = require('mongoose');
const { SUBSCRIPTION } = require('../../utils/constants');
const categorySchema = Schema(
    {
        name: { type: String, required: true },
        planType: { type: String, enum: ['monthly', 'yearly', 'lifetime', 'custom'], default: 'monthly' },
        productId: { type: String, default: 'com.thelawmens.monthly' },
        googlePlaySku: { type: String, default: 'com.thelawmens.monthly' },
        validity: { type: Number, required: true }, // Validity in days (30 or 365)
        count: { type: Number, default: 1 },
        price: { type: Number, required: true }, // Amount in INR
        discount: { type: Number, default: 0 },
        description: { type: String },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(SUBSCRIPTION, categorySchema);

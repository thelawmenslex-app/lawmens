const { Schema, model } = require('mongoose');
const { OFFER } = require('../../utils/constants');

const offerSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        discountType: { type: String, enum: ['flat', 'percentage'], required: true },
        discountValue: { type: Number, required: true },
        offerType: { type: String, enum: ['festival', 'student', 'limited-time', 'general'], default: 'general' },
        bannerImage: { type: String }, // banner image path/url
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(OFFER, offerSchema);

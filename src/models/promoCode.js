const { Schema, model } = require('mongoose');
const { PROMOCODE } = require('../../utils/constants');

const promoCodeSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountType: { type: String, enum: ['flat', 'percentage'], required: true },
        discountValue: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
        usageLimit: { type: Number, default: 0 }, // 0 = unlimited
        usedCount: { type: Number, default: 0 },
        minPurchaseAmount: { type: Number, default: 0 },
        maxDiscountAmount: { type: Number, default: 0 }, // for percentage discounts
        restrictUserType: { type: String, enum: ['all', 'new', 'trial', 'expired'], default: 'all' },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(PROMOCODE, promoCodeSchema);

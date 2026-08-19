const { Schema, model } = require('mongoose');
const { PUSHNOTIFICATION } = require('../../utils/constants');

const pushNotificationSchema = new Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        targetGroup: { type: String, enum: ['all', 'premium', 'trial', 'expired', 'individual'], default: 'all' },
        targetUserId: { type: Schema.Types.ObjectId, ref: 'user', default: null },
        scheduledAt: { type: Date, default: Date.now },
        sentAt: { type: Date, default: null },
        status: { type: String, enum: ['scheduled', 'sent', 'failed'], default: 'scheduled' },
        notificationType: { type: String, default: 'general' }, // legal-update, promo, trial-expiry, emergency
        deliveryCount: { type: Number, default: 0 },
        isPopup: { type: Boolean, default: false },
        buttonText: { type: String, default: 'Dismiss' },
        actionUrl: { type: String, default: '' }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(PUSHNOTIFICATION, pushNotificationSchema);

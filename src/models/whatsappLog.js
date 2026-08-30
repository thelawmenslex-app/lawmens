const { Schema, model } = require('mongoose');

const whatsappLogSchema = new Schema(
    {
        recipientPhone: { type: String, required: true, index: true },
        recipientName: { type: String, default: '' },
        messageType: { type: String, enum: ['otp', 'broadcast', 'transactional', 'custom'], default: 'otp' },
        message: { type: String, required: true },
        status: { type: String, enum: ['sent', 'delivered', 'failed', 'pending'], default: 'sent' },
        targetGroup: { type: String, default: 'individual' },
        providerResponse: { type: Object, default: {} },
        errorMessage: { type: String, default: '' }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('WhatsAppLog', whatsappLogSchema);

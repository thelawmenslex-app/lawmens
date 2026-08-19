const { Schema, model } = require('mongoose');

const auditLogSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'auditlogs',
    }
);

// Index to quickly query logs by admin user or date range
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = model('AUDITLOG', auditLogSchema);

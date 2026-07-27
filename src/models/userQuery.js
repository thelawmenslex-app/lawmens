const { Schema, model } = require('mongoose');

const userQuerySchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        userName: { type: String, default: 'User' },
        userEmail: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
        subject: { type: String, required: true },
        question: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Answered', 'Closed'], default: 'Pending' },
        adminReply: { type: String, default: '' },
        repliedAt: { type: Date },
        repliedBy: { type: String, default: '' }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('UserQuery', userQuerySchema);

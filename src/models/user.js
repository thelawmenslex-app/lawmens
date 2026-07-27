const { model, Schema } = require('mongoose');
const constants = require('../../utils/constants');
const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        password: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        otp: {
            type: String,
            default: null,
        },
        otpCreatedOn: {
            type: Date
        },
        bookMarks: [],
        freeContent: { type: Number, default: 0 },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: constants.SUBSCRIPTION,
        },
        professionId: {
            type: Schema.Types.ObjectId,
            ref: constants.PROFESSION,
        },
        role: {
            type: String,
            enum: ['Admin', 'Editor', 'Moderator', 'Support', 'Super Admin', 'User'],
            default: 'User'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        },
        lastActive: {
            type: Date,
            default: Date.now
        },
        trialStartDate: {
            type: Date,
            default: Date.now
        },
        trialEndDate: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        isTrialUsed: {
            type: Boolean,
            default: false
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        premiumPurchaseDate: {
            type: Date,
            default: null
        },
        premiumPaymentId: {
            type: String,
            default: null
        },
        currentDeviceId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ professionId: 1 });

module.exports = model(constants.USER, userSchema);


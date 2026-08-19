const { Schema, model } = require('mongoose');

const noteSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        sectionId: {
            type: String, // String representation or ObjectId of the casebook section
            required: true,
        },
        noteText: {
            type: String,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'notes',
    }
);

noteSchema.index({ userId: 1, sectionId: 1 });
noteSchema.index({ updatedAt: -1 });

module.exports = model('NOTE', noteSchema);

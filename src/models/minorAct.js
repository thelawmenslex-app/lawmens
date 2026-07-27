const { Schema, model } = require('mongoose');

const minorActSchema = Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        pdfUrl: { type: String },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model('MinorAct', minorActSchema);

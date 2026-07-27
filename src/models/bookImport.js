const { Schema, model } = require('mongoose');
const { CATEGORY, USER } = require('../../utils/constants');

const bookImportSchema = Schema(
    {
        bookName: { type: String, required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: CATEGORY, required: true },
        originalFileName: { type: String },
        extractedJson: { type: Schema.Types.Mixed, default: null },
        status: { 
            type: String, 
            enum: ['pending', 'extracting', 'ocr', 'parsed', 'validated', 'imported', 'failed'], 
            default: 'pending' 
        },
        progress: { type: Number, default: 0 },
        validationReport: {
            errors: { type: [String], default: [] },
            warnings: { type: [String], default: [] },
            suggestions: { type: [String], default: [] }
        },
        version: { type: Number, default: 1 },
        uploadedBy: { type: Schema.Types.ObjectId, ref: USER },
        changelog: { type: String, default: '' },
        rollbackHistory: [
            {
                version: { type: Number },
                restoredAt: { type: Date, default: Date.now },
                restoredBy: { type: Schema.Types.ObjectId, ref: USER },
                backupCasebook: { type: Schema.Types.Mixed }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('BookImport', bookImportSchema);

const { Schema, model } = require('mongoose');

const minorActSectionSchema = Schema(
    {
        minorActId: {
            type: Schema.Types.ObjectId,
            ref: 'MinorAct',
            required: true,
            index: true
        },
        chapter: { type: String },
        sectionNumber: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model('MinorActSection', minorActSectionSchema);

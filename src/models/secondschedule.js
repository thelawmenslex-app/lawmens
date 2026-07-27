const { Schema, model } = require('mongoose');

const secondscheduleSchema = new Schema(
    {
        categoryId: { type: Schema.Types.ObjectId, ref: 'category', required: true },
        formNo: { type: String },
        title: { type: String },
        content: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'secondschedule',
    }
);

module.exports = model('SECONDSCHEDULE', secondscheduleSchema);

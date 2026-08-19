const { Schema, model } = require('mongoose');
//const { FIRSTSCHEDULE } = require('../../utils/constants');

const firstscheduleSchema = new Schema(
    {
        categoryId: { type: Schema.Types.ObjectId, ref: 'category', required: true },
        Section: { type: String },
        Offence: { type: String },
        Punishment: { type: String },        
        'Cognizable or Non- cognizable' : { type: String },        
        'Bailable or Non- bailable' : { type: String },
        'By what Court triable' : { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'firstschedule',
    }
);

module.exports = model('FIRSTSCHEDULE', firstscheduleSchema);

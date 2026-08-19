const { Schema, model } = require('mongoose');
const { CASEBOOK, CATEGORY } = require('../../utils/constants');
const category = require('./category');
const casebookSchema = Schema(
    {
        name: { type: String },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: CATEGORY,
        },
        section: [{
            name: { type: String },
            content: [{ content: { type: String, default: "No content available" }, page: { type: Number } }],
            oldversion: { type: String },
            keyword: { type: String },
            sectionId: { type: String }
        }],
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

casebookSchema.index({ categoryId: 1, name: 1 });
casebookSchema.index({ 
    name: 'text', 
    'section.name': 'text', 
    'section.keyword': 'text', 
    'section.content.content': 'text' 
}, {
    weights: {
        name: 10,
        'section.name': 5,
        'section.keyword': 3,
        'section.content.content': 1
    },
    name: "CasebookTextSearchIndex"
});

module.exports = model(CASEBOOK, casebookSchema);

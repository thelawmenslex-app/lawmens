const { Schema, model } = require('mongoose');

const signupConfigSchema = new Schema(
    {
        fieldKey: { type: String, required: true, unique: true }, // e.g., 'barCouncilNumber', 'city', 'state', 'customField1'
        label: { type: String, required: true },
        fieldType: { type: String, enum: ['text', 'number', 'email', 'select', 'textarea'], default: 'text' },
        isRequired: { type: Boolean, default: false },
        isEnabled: { type: Boolean, default: true },
        options: [{ type: String }], // Dropdown choices if fieldType === 'select'
        order: { type: Number, default: 0 },
        placeholder: { type: String, default: '' },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model('SignupConfig', signupConfigSchema);

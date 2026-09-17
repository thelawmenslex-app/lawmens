const { Schema, model } = require('mongoose');
const { SETTING } = require('../../utils/constants');
const categorySchema = Schema(
    {
        email: { type: String, default: "thelawmenslex@gmail.com" },
        phoneNumber: { type: String, default: "+91 93858 11823" },
        supportEmail: { type: String, default: "thelawmenslex@gmail.com" },
        supportPhone: { type: String, default: "+91 93858 11823" },
        grievanceOfficerName: { type: String, default: "Legal Compliance & Grievance Officer" },
        grievanceEmail: { type: String, default: "thelawmenslex@gmail.com" },
        officeAddress: { type: String, default: "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India" },
        workingHours: { type: String, default: "Monday to Saturday, 10:00 AM – 6:00 PM IST" },
        officialWebsite: { type: String, default: "https://thelawmens.com" },
        companyName: { type: String, default: "THE-LAWMEN'S" },
        disclaimerText: {
            type: String,
            default: "APP DISCLAIMER\n\nTHE-LAWMEN’S is an independent legal-information and research platform. The information provided is for educational and research purposes only and does not constitute legal advice. Laws, amendments and judicial decisions may change. Users must independently verify the prevailing law from authentic official sources before relying upon any information. THE-LAWMEN’S is not a Government application.\n\nUse of the Application is subject to the Terms and Conditions and Privacy Policy."
        },
        trialDays: { type: Number, default: 14 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);
module.exports = model(SETTING, categorySchema);

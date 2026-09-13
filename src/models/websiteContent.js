const { Schema, model } = require('mongoose');

const sectionContentSchema = new Schema({
    hero: {
        headline: { type: String, default: "India's Smart Legal Research Platform" },
        supportingContent: { type: String, default: "THE-LAWMEN'S is an advanced LegalTech platform dedicated to simplifying Indian legal research through technology and innovation." },
        ctaPrimaryText: { type: String, default: "Explore THE-LAWMEN'S" },
        ctaPrimaryLink: { type: String, default: "/app-download" },
        ctaSecondaryText: { type: String, default: "Download App" },
        ctaSecondaryLink: { type: String, default: "/app-download" },
        ctaTrialText: { type: String, default: "Start Free Trial" },
        ctaTrialLink: { type: String, default: "/pricing" },
        heroImageUrl: { type: String, default: "/hero-legal-tech.png" }
    },
    about: {
        title: { type: String, default: "About THE-LAWMEN'S" },
        content: { type: String, default: "THE-LAWMEN'S provides quick, reliable, and user-friendly access to statutes, comparative legal provisions, and legal reference materials for advocates, judges, Legal Fraternity, academicians, government officials, law enforcement agencies, corporate professionals, and the general public." },
        tagline: { type: String, default: "Empowering Legal Knowledge. Advancing Justice." }
    },
    vision: {
        title: { type: String, default: "Our Vision" },
        content: { type: String, default: "To become India's most trusted and comprehensive LegalTech platform by providing accurate, accessible, and technology-driven legal resources that promote legal awareness, professional excellence, and access to justice." }
    },
    mission: [
        { type: String }
    ],
    coreValues: [
        {
            title: { type: String },
            description: { type: String }
        }
    ],
    whyChooseUs: [
        { type: String }
    ],
    appLinks: {
        googlePlayUrl: { type: String, default: "https://play.google.com/store/apps/details?id=com.thelawmens.app" },
        appStoreUrl: { type: String, default: "https://apps.apple.com/app/the-lawmens/id123456789" },
        qrCodeUrl: { type: String, default: "/app-qr-code.png" },
        websiteUrl: { type: String, default: "https://www.the-lawmens.com" },
        supportEmail: { type: String, default: "support@thelawmens.com" }
    },
    socialLinks: {
        linkedin: { type: String, default: "https://www.linkedin.com/company/thelawmens" },
        twitter: { type: String, default: "https://twitter.com/thelawmens" },
        facebook: { type: String, default: "https://facebook.com/thelawmens" },
        instagram: { type: String, default: "https://instagram.com/thelawmens" },
        youtube: { type: String, default: "https://youtube.com/@thelawmens" },
        whatsapp: { type: String, default: "https://wa.me/919876543210" }
    },
    legalPages: {
        disclaimer: { type: String, default: "THE-LAWMEN'S is an independent legal research and educational platform." },
        editorialPolicy: { type: String, default: "THE-LAWMEN'S is committed to high standards of accuracy and authenticity." },
        privacyPolicy: { type: String, default: "Your privacy is paramount." },
        termsAndConditions: { type: String, default: "Usage of THE-LAWMEN'S digital services is subject to fair legal research use." }
    },
    announcement: {
        enabled: { type: Boolean, default: false },
        message: { type: String, default: "" },
        link: { type: String, default: "" }
    }
}, { _id: false });

const websiteContentSchema = new Schema(
    {
        key: { type: String, required: true, unique: true, default: "main_website" },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
        publishedContent: { type: sectionContentSchema, required: true },
        draftContent: { type: sectionContentSchema, required: true },
        lastUpdatedBy: { type: String, default: "System Admin" }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = model('WebsiteContent', websiteContentSchema);

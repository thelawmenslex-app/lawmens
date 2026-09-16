const WebsiteContent = require('../models/websiteContent');
const UserQuery = require('../models/userQuery');
const Settings = require('../models/settings');
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const DEFAULT_WEBSITE_DATA = {
    hero: {
        headline: "India's Smart Legal Research Platform",
        supportingContent: "THE-LAWMEN'S is an advanced LegalTech platform dedicated to simplifying Indian legal research through technology and innovation.",
        ctaPrimaryText: "Explore THE-LAWMEN'S",
        ctaPrimaryLink: "/compare-bns",
        ctaSecondaryText: "Download App",
        ctaSecondaryLink: "/app-download",
        ctaTrialText: "Start Free Trial",
        ctaTrialLink: "/pricing",
        heroImageUrl: "/hero-legal-tech.png"
    },
    about: {
        title: "About THE-LAWMEN'S",
        content: "THE-LAWMEN'S provides quick, reliable, and user-friendly access to statutes, comparative legal provisions, and legal reference materials.",
        tagline: "Empowering Legal Knowledge. Advancing Justice."
    },
    vision: {
        title: "Our Vision",
        content: "To become India's most trusted and comprehensive LegalTech platform."
    },
    mission: [
        "To make Indian laws easily accessible to everyone.",
        "To simplify legal research using innovative technology.",
        "To promote legal literacy and public awareness."
    ],
    coreValues: [
        { title: "Integrity", description: "Authentic and reliable legal information." },
        { title: "Excellence", description: "Highest professional standards." }
    ],
    whyChooseUs: [
        "Comprehensive legal research platform",
        "Comparative analysis of old and new criminal laws (IPC & BNS)"
    ],
    appLinks: {
        googlePlayUrl: "https://play.google.com/store/apps/details?id=com.thelawmens.app",
        appStoreUrl: "https://apps.apple.com/app/the-lawmens/id123456789",
        qrCodeUrl: "/app-qr-code.png",
        websiteUrl: "https://the-lawmens.com",
        supportEmail: "thelawmenslex@gmail.com"
    },
    socialLinks: {
        linkedin: "https://www.linkedin.com/company/thelawmens",
        twitter: "https://twitter.com/thelawmens",
        facebook: "https://facebook.com/thelawmens",
        instagram: "https://instagram.com/thelawmens",
        youtube: "https://youtube.com/@thelawmens",
        whatsapp: "https://wa.me/919876543210"
    },
    legalPages: {
        disclaimer: "THE-LAWMEN'S is an independent legal research platform.",
        editorialPolicy: "High standards of accuracy and authenticity.",
        privacyPolicy: "Your privacy is paramount.",
        termsAndConditions: "Usage of THE-LAWMEN'S digital services is subject to fair legal research use."
    },
    announcement: {
        enabled: false,
        message: "",
        link: ""
    }
};

exports.getPublicSettings = catchAsync(async (req, res) => {
    let setting = await Settings.findOne().lean();
    if (!setting) {
        setting = {
            companyName: "THE-LAWMEN'S",
            supportEmail: "thelawmenslex@gmail.com",
            supportPhone: "+91 93858 11823",
            grievanceOfficerName: "Legal Compliance & Grievance Officer",
            grievanceEmail: "thelawmenslex@gmail.com",
            officeAddress: "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
            workingHours: "Monday to Saturday, 10:00 AM – 6:00 PM IST",
            officialWebsite: "https://the-lawmens.com",
            disclaimerText: "APP DISCLAIMER\n\nTHE-LAWMEN’S is an independent legal-information and research platform. The information provided is for educational and research purposes only and does not constitute legal advice. Laws, amendments and judicial decisions may change. Users must independently verify the prevailing law from authentic official sources before relying upon any information. THE-LAWMEN’S is not a Government application.\n\nUse of the Application is subject to the Terms and Conditions and Privacy Policy.",
            trialDays: 14,
            isActive: true
        };
    }

    const formatted = {
        ...setting,
        companyName: setting.companyName || "THE-LAWMEN'S",
        grievanceOfficer: setting.grievanceOfficerName || "Legal Compliance & Grievance Officer",
        grievanceOfficerName: setting.grievanceOfficerName || "Legal Compliance & Grievance Officer",
        grievanceEmail: setting.grievanceEmail || setting.supportEmail || "thelawmenslex@gmail.com",
        email: setting.supportEmail || setting.email || "thelawmenslex@gmail.com",
        supportEmail: setting.supportEmail || setting.email || "thelawmenslex@gmail.com",
        phone: setting.supportPhone || setting.phoneNumber || "+91 93858 11823",
        phoneNumber: setting.supportPhone || setting.phoneNumber || "+91 93858 11823",
        supportPhone: setting.supportPhone || setting.phoneNumber || "+91 93858 11823",
        address: setting.officeAddress || "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
        officeAddress: setting.officeAddress || "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
        workingHours: setting.workingHours || "Monday to Saturday, 10:00 AM – 6:00 PM IST",
        website: setting.officialWebsite || "https://the-lawmens.com",
        websiteUrl: setting.officialWebsite || "https://the-lawmens.com",
        officialWebsite: setting.officialWebsite || "https://the-lawmens.com",
        disclaimerText: setting.disclaimerText
    };

    return res.status(200).json({
        success: true,
        status: true,
        data: formatted
    });
});

exports.getPublicContent = catchAsync(async (req, res) => {
    let [doc, setting] = await Promise.all([
        WebsiteContent.findOne({ key: "main_website" }).lean(),
        Settings.findOne().lean()
    ]);

    if (!doc) {
        doc = await WebsiteContent.create({
            key: "main_website",
            status: "published",
            publishedContent: DEFAULT_WEBSITE_DATA,
            draftContent: DEFAULT_WEBSITE_DATA,
            lastUpdatedBy: "System"
        });
    }

    const baseContent = doc.publishedContent || DEFAULT_WEBSITE_DATA;

    const mergedData = {
        ...baseContent,
        companyName: setting?.companyName || "THE-LAWMEN'S",
        supportEmail: setting?.supportEmail || setting?.email || "thelawmenslex@gmail.com",
        email: setting?.supportEmail || setting?.email || "thelawmenslex@gmail.com",
        supportPhone: setting?.supportPhone || setting?.phoneNumber || "+91 93858 11823",
        phone: setting?.supportPhone || setting?.phoneNumber || "+91 93858 11823",
        grievanceOfficer: setting?.grievanceOfficerName || "Legal Compliance & Grievance Officer",
        grievanceOfficerName: setting?.grievanceOfficerName || "Legal Compliance & Grievance Officer",
        grievanceEmail: setting?.grievanceEmail || setting?.supportEmail || "thelawmenslex@gmail.com",
        address: setting?.officeAddress || "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
        officeAddress: setting?.officeAddress || "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
        workingHours: setting?.workingHours || "Monday to Saturday, 10:00 AM – 6:00 PM IST",
        website: setting?.officialWebsite || "https://the-lawmens.com",
        websiteUrl: setting?.officialWebsite || "https://the-lawmens.com",
        officialWebsite: setting?.officialWebsite || "https://the-lawmens.com",
        disclaimerText: setting?.disclaimerText,
        contactInfo: {
            companyName: setting?.companyName || "THE-LAWMEN'S",
            grievanceOfficer: setting?.grievanceOfficerName || "Legal Compliance & Grievance Officer",
            email: setting?.supportEmail || "thelawmenslex@gmail.com",
            phone: setting?.supportPhone || "+91 93858 11823",
            address: setting?.officeAddress || "No. 12, Lawyers Chamber, High Court Complex, Chennai - 600104, Tamil Nadu, India",
            workingHours: setting?.workingHours || "Monday to Saturday, 10:00 AM – 6:00 PM IST",
            website: setting?.officialWebsite || "https://the-lawmens.com"
        }
    };

    return res.status(200).json({
        success: true,
        data: mergedData,
        updatedAt: doc.updatedAt
    });
});

exports.getDraftContent = catchAsync(async (req, res) => {
    let doc = await WebsiteContent.findOne({ key: "main_website" });
    if (!doc) {
        doc = await WebsiteContent.create({
            key: "main_website",
            status: "published",
            publishedContent: DEFAULT_WEBSITE_DATA,
            draftContent: DEFAULT_WEBSITE_DATA,
            lastUpdatedBy: "System"
        });
    }
    return res.status(200).json({
        success: true,
        status: doc.status,
        data: doc.draftContent || DEFAULT_WEBSITE_DATA,
        publishedData: doc.publishedContent || DEFAULT_WEBSITE_DATA,
        lastUpdatedBy: doc.lastUpdatedBy,
        updatedAt: doc.updatedAt
    });
});

exports.updateDraftContent = catchAsync(async (req, res) => {
    const { hero, about, vision, mission, coreValues, whyChooseUs, appLinks, socialLinks, legalPages, announcement } = req.body;
    let doc = await WebsiteContent.findOne({ key: "main_website" });
    
    const newDraft = {
        hero: hero || (doc ? doc.draftContent.hero : DEFAULT_WEBSITE_DATA.hero),
        about: about || (doc ? doc.draftContent.about : DEFAULT_WEBSITE_DATA.about),
        vision: vision || (doc ? doc.draftContent.vision : DEFAULT_WEBSITE_DATA.vision),
        mission: Array.isArray(mission) ? mission : (doc ? doc.draftContent.mission : DEFAULT_WEBSITE_DATA.mission),
        coreValues: Array.isArray(coreValues) ? coreValues : (doc ? doc.draftContent.coreValues : DEFAULT_WEBSITE_DATA.coreValues),
        whyChooseUs: Array.isArray(whyChooseUs) ? whyChooseUs : (doc ? doc.draftContent.whyChooseUs : DEFAULT_WEBSITE_DATA.whyChooseUs),
        appLinks: appLinks || (doc ? doc.draftContent.appLinks : DEFAULT_WEBSITE_DATA.appLinks),
        socialLinks: socialLinks || (doc ? doc.draftContent.socialLinks : DEFAULT_WEBSITE_DATA.socialLinks),
        legalPages: legalPages || (doc ? doc.draftContent.legalPages : DEFAULT_WEBSITE_DATA.legalPages),
        announcement: announcement || (doc ? doc.draftContent.announcement : DEFAULT_WEBSITE_DATA.announcement)
    };

    if (!doc) {
        doc = await WebsiteContent.create({
            key: "main_website",
            status: "draft",
            publishedContent: DEFAULT_WEBSITE_DATA,
            draftContent: newDraft,
            lastUpdatedBy: req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email : "Admin"
        });
    } else {
        doc.draftContent = newDraft;
        doc.status = "draft";
        doc.lastUpdatedBy = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email : "Admin";
        await doc.save();
    }

    return res.status(200).json({
        success: true,
        message: "Draft updated successfully",
        status: doc.status,
        data: doc.draftContent
    });
});

exports.publishWebsiteContent = catchAsync(async (req, res) => {
    let doc = await WebsiteContent.findOne({ key: "main_website" });
    if (!doc) {
        doc = await WebsiteContent.create({
            key: "main_website",
            status: "published",
            publishedContent: DEFAULT_WEBSITE_DATA,
            draftContent: DEFAULT_WEBSITE_DATA,
            lastUpdatedBy: "Admin"
        });
    } else {
        doc.publishedContent = doc.draftContent;
        doc.status = "published";
        doc.lastUpdatedBy = req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email : "Admin";
        await doc.save();
    }

    return res.status(200).json({
        success: true,
        message: "Website content published live successfully!",
        data: doc.publishedContent
    });
});

exports.submitPublicContact = catchAsync(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Email, subject, and message are required."
        });
    }

    const sanitizedEmail = String(email).trim().toLowerCase();
    const sanitizedName = name ? String(name).trim() : "Website Visitor";
    const sanitizedPhone = phone ? String(phone).trim() : "";
    const sanitizedSubject = String(subject).trim();
    const sanitizedMessage = String(message).trim();

    const query = await UserQuery.create({
        userName: sanitizedName,
        userEmail: sanitizedEmail,
        phoneNumber: sanitizedPhone,
        subject: `[Website Contact] ${sanitizedSubject}`,
        question: sanitizedMessage,
        status: "Pending"
    });

    return res.status(201).json({
        success: true,
        message: "Thank you for contacting THE-LAWMEN'S. Our support team will get back to you shortly.",
        queryId: query._id
    });
});

exports.getDemoComparison = catchAsync(async (req, res) => {
    const demoPairs = [
        {
            id: "sec-302-103",
            topic: "Murder & Punishment for Murder",
            oldLaw: {
                code: "IPC (Indian Penal Code 1860)",
                section: "Section 302",
                title: "Punishment for murder",
                summary: "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine."
            },
            newLaw: {
                code: "BNS (Bharatiya Nyaya Sanhita 2023)",
                section: "Section 103",
                title: "Punishment for murder & mob lynching",
                summary: "Sub-section (1): Punishment with death or life imprisonment and fine. Sub-section (2): Specific provision introduced for murder by a group of 5 or more persons."
            },
            changeType: "Modified & Expanded",
            keyHighlights: ["Added sub-section (2) specifically criminalizing Mob Lynching", "Penalty aligned with statutory standards"]
        }
    ];

    return res.status(200).json({
        success: true,
        count: demoPairs.length,
        data: demoPairs
    });
});

const router = require('express').Router();
let rateLimit;
try {
    rateLimit = require('express-rate-limit');
} catch (e) {
    rateLimit = () => (req, res, next) => next();
}
const websiteController = require('./website.controller');
const { auth } = require('../../middleware/auth.middleware');
const { checkRole } = require('../../middleware/role.middleware');

// Security rate limiter for public contact form submissions (5 requests per 15 minutes per IP)
const contactRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many contact enquiries submitted from this IP address. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Security rate limiter for public content endpoint
const contentRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
});

// ==========================================
// 1. PUBLIC WEBSITE ROUTES
// ==========================================
router.get('/content', contentRateLimiter, websiteController.getPublicContent);
router.get('/settings', websiteController.getPublicSettings);
router.get('/demo-comparison', websiteController.getDemoComparison);
router.post('/contact', contactRateLimiter, websiteController.submitPublicContact);

// ==========================================
// 2. PROTECTED ADMIN CMS ROUTES
// ==========================================
router.use(auth);
router.get('/admin/content', checkRole(['Admin', 'Super Admin', 'Editor']), websiteController.getDraftContent);
router.put('/admin/content', checkRole(['Admin', 'Super Admin', 'Editor']), websiteController.updateDraftContent);
router.post('/admin/publish', checkRole(['Admin', 'Super Admin', 'Editor']), websiteController.publishWebsiteContent);

module.exports = router;

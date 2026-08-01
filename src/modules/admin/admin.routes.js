const router = require('express').Router();
const multer = require('multer');
const { auth } = require('../../../middleware/auth.middleware');
const { checkRole } = require('../../../middleware/role.middleware');
const adminController = require('./admin.controller');
const adminAuthController = require('./adminAuth.controller');

// Config multer memory storage for law books uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ==========================================
// 1. PUBLIC ADMIN AUTH ROUTES
// ==========================================
router.post('/login', adminAuthController.login);
router.post('/forgot-password', adminAuthController.forgotPassword);
router.post('/verify-otp', adminAuthController.verifyOtp);
router.post('/reset-password', adminAuthController.resetPassword);

// ==========================================
// 2. PROTECTED ADMIN ROUTE GROUPS
// ==========================================
router.use(auth);

// Admin Analytics Dashboard
router.get('/analytics', checkRole(['Admin', 'Super Admin']), adminController.getAnalytics);

// User Management Actions
router.get('/users', checkRole(['Admin', 'Super Admin', 'Moderator']), adminController.getUsers);
router.get('/users/:userId', checkRole(['Admin', 'Super Admin', 'Moderator']), adminController.getUserProfile);
router.put('/users/:userId', checkRole(['Admin', 'Super Admin']), adminController.updateUserProfile);
router.put('/users/:userId/status', checkRole(['Admin', 'Super Admin']), adminController.toggleUserStatus);
router.delete('/users/:userId', checkRole(['Admin', 'Super Admin']), adminController.deleteUser);
router.post('/users/:userId/force-logout', checkRole(['Admin', 'Super Admin']), adminController.forceLogoutUser);

// Subscription & Payment logs
router.get('/payments', checkRole(['Admin', 'Super Admin', 'Finance Manager']), adminController.getPayments);
router.post('/payments/manual', checkRole(['Admin', 'Super Admin', 'Finance Manager']), adminController.manualSubscribe);
router.put('/payments/cancel', checkRole(['Admin', 'Super Admin', 'Finance Manager']), adminController.cancelSubscription);

// Law Book upload & validation imports
router.post('/books/upload', checkRole(['Admin', 'Super Admin', 'Editor']), upload.single('bookFile'), adminController.uploadBook);
router.post('/books/import', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.importBook);

// Offers Campaigns CRUD
router.get('/offers', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.getOffers);
router.post('/offers', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.createOffer);
router.delete('/offers/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deleteOffer);

// Promo Codes CRUD
router.get('/promo-codes', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.getPromoCodes);
router.post('/promo-codes', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.createPromoCode);
router.delete('/promo-codes/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deletePromoCode);

// Push Notifications Center
router.post('/notifications/send', checkRole(['Admin', 'Super Admin', 'Support']), adminController.sendPushNotification);
router.get('/notifications/history', checkRole(['Admin', 'Super Admin', 'Support']), adminController.getNotificationLogs);
router.put('/notifications/:id', checkRole(['Admin', 'Super Admin', 'Support']), adminController.updatePushNotification);
router.delete('/notifications/:id', checkRole(['Admin', 'Super Admin', 'Support']), adminController.deletePushNotification);

// Global App Settings
router.get('/settings', checkRole(['Admin', 'Super Admin']), adminController.getSettings);
router.put('/settings', checkRole(['Admin', 'Super Admin']), adminController.updateSettings);

// Content Management CRUD (Category, Chapter, Section)
router.post('/content/categories', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.createCategory);
router.put('/content/categories/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.updateCategory);
router.delete('/content/categories/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deleteCategory);

router.post('/content/chapters', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.createChapter);
router.put('/content/chapters/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.updateChapter);
router.delete('/content/chapters/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deleteChapter);

router.post('/content/sections', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.createSection);
router.put('/content/sections/:chapterId/:sectionId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.updateSection);
router.delete('/content/sections/:chapterId/:sectionId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deleteSection);

// AI Import Pipeline Actions
router.post('/content/import/upload', checkRole(['Admin', 'Super Admin', 'Editor']), upload.single('bookFile'), adminController.uploadBookImport);
router.get('/content/import/status/:jobId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.getImportJobStatus);
router.put('/content/import/edit/:jobId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.editImportJobData);
router.post('/content/import/publish/:jobId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.publishImportJob);
router.get('/content/import/versions/:categoryId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.getVersionHistory);
router.post('/content/import/rollback/:jobId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.rollbackVersion);
router.get('/content/export/:categoryId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.exportCategoryContent);
router.put('/content/import/publish-existing/:categoryId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.publishExistingContent);
router.put('/content/schedule/publish-first/:categoryId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.publishFirstSchedule);
router.put('/content/schedule/publish-second/:categoryId', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.publishSecondSchedule);

// Schedule editor image upload — disk storage to public/schedule-images/
const diskUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'public/schedule-images/'),
        filename: (req, file, cb) => {
            const ext = require('path').extname(file.originalname);
            cb(null, `schedule_img_${Date.now()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
router.post('/content/schedule/upload-image', checkRole(['Admin', 'Super Admin', 'Editor']), diskUpload.single('image'), adminController.uploadScheduleImage);

// Schedule PDF upload — stores PDF in public/schedule-pdfs/
const pdfDiskUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'public/schedule-pdfs/'),
        filename: (req, file, cb) => {
            const ext = require('path').extname(file.originalname);
            cb(null, `schedule_pdf_${Date.now()}${ext}`);
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for PDFs
});
router.post('/content/schedule/upload-pdf/:categoryId/:scheduleType', checkRole(['Admin', 'Super Admin', 'Editor']), pdfDiskUpload.single('pdf'), adminController.uploadSchedulePdf);
router.delete('/content/schedule/clear-pdf/:categoryId/:scheduleType', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.deleteSchedulePdf);

// Minor Act PDF direct upload
const minorActPdfUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const fs = require('fs');
            const uploadPath = 'public/uploads/minor-acts/';
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = require('path').extname(file.originalname);
            cb(null, `minor_act_pdf_${Date.now()}${ext}`);
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Criminal Minor Acts Admin Routes
router.post('/content/minor-acts/parse', checkRole(['Admin', 'Super Admin', 'Editor']), upload.single('file'), adminController.parseMinorActFile);
router.post('/content/minor-acts/publish', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.publishMinorAct);
router.post('/content/minor-acts/upload-pdf', checkRole(['Admin', 'Super Admin', 'Editor']), minorActPdfUpload.single('pdf'), adminController.uploadMinorActPdf);
router.delete('/content/minor-acts/clear-pdf/:id', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.clearMinorActPdf);
router.get('/content/minor-acts', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.getMinorActsList);
router.put('/content/minor-acts/reorder', checkRole(['Admin', 'Super Admin', 'Editor']), adminController.reorderMinorActs);
router.delete('/content/minor-acts/:id', checkRole(['Admin', 'Super Admin']), adminController.deleteMinorAct);

// Audit Logging list
router.get('/audit-logs', checkRole(['Super Admin']), adminController.getAuditLogs);

// Signup Form Builder Customization
router.get('/signup-config', checkRole(['Admin', 'Super Admin']), adminController.getSignupConfig);
router.post('/signup-config', checkRole(['Admin', 'Super Admin']), adminController.updateSignupConfig);

// User Queries & Support Manager
router.get('/queries', checkRole(['Admin', 'Super Admin', 'Support']), adminController.getAdminQueries);
router.post('/queries/:id/reply', checkRole(['Admin', 'Super Admin', 'Support']), adminController.replyUserQuery);

// Admin Profile & Access Management
router.put('/self-profile', adminController.updateAdminSelfProfile);
router.post('/create-admin', checkRole(['Super Admin']), adminController.createAdminUser);

module.exports = router;

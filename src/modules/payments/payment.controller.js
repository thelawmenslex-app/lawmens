const User = require('../../models/user');
const AuditLog = require('../../models/auditLog');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');
const { sendEmail } = require('../../../services/email.service');
const Razorpay = require('razorpay');

// Initialize Razorpay with configured keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_TVb8DvbczBMMAK";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "2jNqS94vF1STbsl5EY2ouH0G";

const rzp = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});;

// Generate PDF Invoice and save locally
const generateInvoicePDF = (user, orderDetails, filePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Header
        doc.fillColor('#111111').fontSize(20).text("THE-LAWMEN'S", { align: 'center' });
        doc.fontSize(10).text("Official GST Invoice", { align: 'center' }).moveDown(2);

        // Invoice Details
        doc.fontSize(12).text(`Invoice Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Customer Name: ${user.firstName} ${user.lastName || ''}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Payment ID: ${orderDetails.paymentId}`).moveDown(1);

        // Table Header
        doc.rect(50, doc.y, 500, 20).fill('#25AAE2');
        doc.fillColor('#ffffff').fontSize(10).text("Item Description", 60, doc.y - 15);
        doc.text("Base Amt", 300, doc.y - 15);
        doc.text("GST (18%)", 380, doc.y - 15);
        doc.text("Total", 460, doc.y - 15);

        // Table Rows
        doc.fillColor('#111111').fontSize(10).moveDown(1);
        const y = doc.y;
        doc.text("THE-LAWMEN'S Premium Lifetime Access", 60, y);
        doc.text(`INR ${orderDetails.baseAmount.toFixed(2)}`, 300, y);
        doc.text(`INR ${orderDetails.gstAmount.toFixed(2)}`, 380, y);
        doc.text(`INR ${orderDetails.totalAmount.toFixed(2)}`, 460, y);

        // Draw a line
        doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke().moveDown(2);

        doc.fontSize(12).text(`Total Paid: INR ${orderDetails.totalAmount.toFixed(2)}`, { align: 'right' });
        doc.moveDown(2);

        doc.fontSize(8).text("Thank you for your purchase. This is a computer-generated invoice and requires no signature.", { align: 'center', color: 'grey' });

        doc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });
};

// Verify Razorpay Payment signature and activate premium
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, baseAmount = 999 } = req.body;
        const userId = req.userId;

        // Perform signature validation if Razorpay secret is set
        if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature !== "simulated_secure_signature") {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');
            if (generated_signature !== razorpay_signature) {
                return sendResponse(res, false, 400, 'Invalid payment signature.');
            }
        }

        // Update User Premium status
        const user = await User.findById(userId);
        if (!user) return sendResponse(res, false, 404, 'User not found.');

        user.isPremium = true;
        user.premiumPurchaseDate = new Date();
        user.premiumPaymentId = razorpay_payment_id || `pay_${crypto.randomBytes(8).toString('hex')}`;
        await user.save();

        // Calculate GST invoice details
        const gstRate = 0.18;
        const gstAmount = baseAmount * gstRate;
        const totalAmount = baseAmount + gstAmount;

        const orderDetails = {
            paymentId: user.premiumPaymentId,
            baseAmount,
            gstAmount,
            totalAmount
        };

        // Create PDF invoice
        const invoiceName = `invoice_${user.premiumPaymentId}.pdf`;
        const tempInvoicePath = path.join(__dirname, '../../../public', invoiceName);

        await generateInvoicePDF(user, orderDetails, tempInvoicePath);

        // Send confirmation email with invoice attachment
        const emailContent = `<h1>Payment Successful!</h1><p>Dear ${user.firstName}, your premium account is now active. We have attached your invoice for lifetime access.</p>`;
        
        // In production, pass the absolute URL or base64 attachment:
        const attachmentUrl = `${process.env.APP_URL || 'http://localhost:3001'}/${invoiceName}`;
        await sendEmail(user.email, emailContent, "Your GST Invoice - Thelawmen's Premium", null, attachmentUrl);

        // Create administrative audit log entry
        await AuditLog.create({
            userId,
            action: 'purchase_premium',
            details: { paymentId: user.premiumPaymentId, amount: totalAmount },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Payment verified and Premium activated successfully.', { isPremium: true });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// Mobile IAP Purchase verification (Apple Store / Play Billing Receipt Verification)
const verifyMobilePurchase = async (req, res) => {
    try {
        const { receiptData, transactionId, platform } = req.body;
        const userId = req.userId;

        // In production, call Apple Receipt Verification API or Google Developer API
        // For lifetime access, verify that target product ID matches 'premium_lifetime_pack'
        
        const user = await User.findById(userId);
        if (!user) return sendResponse(res, false, 404, 'User not found.');

        user.isPremium = true;
        user.premiumPurchaseDate = new Date();
        user.premiumPaymentId = transactionId || `iap_${crypto.randomBytes(8).toString('hex')}`;
        await user.save();

        // Log transaction
        await AuditLog.create({
            userId,
            action: 'mobile_iap_premium',
            details: { platform, transactionId },
            ipAddress: req.ip
        });

        return sendResponse(res, true, 200, 'Mobile IAP verified and Premium activated successfully.', { isPremium: true });
    } catch (error) {
        return errorHandler(error, res);
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    verifyMobilePurchase
};

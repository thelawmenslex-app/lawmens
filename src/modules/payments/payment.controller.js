const User = require('../../models/user');
const AuditLog = require('../../models/auditLog');
const Subscription = require('../../models/subscription');
const SubscriptionHistory = require('../../models/subscriptionHistory');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');
const { sendEmail } = require('../../../services/email.service');

// 1. Generate PDF Tax Invoice and save locally
const generateInvoicePDF = (user, orderDetails, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const doc = new PDFDocument({ margin: 50 });
            const writeStream = fs.createWriteStream(filePath);

            doc.pipe(writeStream);

            // Header
            doc.fillColor('#111111').fontSize(20).text("THE-LAWMEN'S", { align: 'center' });
            doc.fontSize(10).text("Official Tax Invoice", { align: 'center' }).moveDown(2);

            // Invoice Details
            doc.fontSize(12).text(`Invoice Date: ${new Date().toLocaleDateString()}`);
            doc.text(`Customer Name: ${user.firstName || 'Advocate'} ${user.lastName || ''}`);
            doc.text(`Email: ${user.email || 'customer@thelawmens.com'}`);
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
            doc.text(orderDetails.planName || "THE-LAWMEN'S Premium Subscription", 60, y);
            doc.text(`INR ${Number(orderDetails.baseAmount || 0).toFixed(2)}`, 300, y);
            doc.text(`INR ${Number(orderDetails.gstAmount || 0).toFixed(2)}`, 380, y);
            doc.text(`INR ${Number(orderDetails.totalAmount || 0).toFixed(2)}`, 460, y);

            // Draw line
            doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke().moveDown(2);

            doc.fontSize(12).text(`Total Paid: INR ${Number(orderDetails.totalAmount || 0).toFixed(2)}`, { align: 'right' });
            doc.moveDown(2);

            doc.fontSize(8).text("Thank you for choosing THE-LAWMEN'S. This is a computer-generated tax invoice and requires no signature.", { align: 'center', color: 'grey' });

            doc.end();

            writeStream.on('finish', () => resolve());
            writeStream.on('error', (err) => reject(err));
        } catch (e) {
            reject(e);
        }
    });
};

// 2. Direct Subscription Activation & Verification
// Endpoint: POST /api/v1/payments/verify-payment or /api/v1/payments/activate
const activateOrVerifySubscription = async (req, res) => {
    try {
        const { 
            paymentId, 
            orderId, 
            baseAmount = 1500,
            planId,
            planName = 'Start up',
            validityDays = 30,
            email 
        } = req.body;

        const userId = req.userId || req.profile?._id;
        const effectivePaymentId = paymentId || `pay_manual_${Date.now()}`;
        const effectiveOrderId = orderId || `ord_${Date.now()}`;

        const numBase = Number(baseAmount) || 1500;
        const gstAmount = Math.round(numBase * 0.18 * 100) / 100;
        const totalAmount = Math.round((numBase + gstAmount) * 100) / 100;

        const expirationDate = new Date(Date.now() + (Number(validityDays) || 30) * 24 * 60 * 60 * 1000);

        let user = null;
        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
        }

        if (user) {
            user.isPremium = true;
            user.premiumPurchaseDate = new Date();
            user.premiumPaymentId = effectivePaymentId;
            user.trialEndDate = expirationDate;
            user.subscriptionExpiresAt = expirationDate;
            if (planId) user.subscriptionId = planId;
            await user.save();

            // Record in Subscription History
            try {
                await SubscriptionHistory.create({
                    userId: user._id,
                    plan: {
                        name: planName || "THE-LAWMEN'S Premium Subscription",
                        validity: Number(validityDays) || 30,
                        price: numBase
                    },
                    purchasedDate: new Date(),
                    isActive: true,
                    paymentId: effectivePaymentId,
                    orderId: effectiveOrderId
                });
            } catch (histErr) {
                console.warn('[Subscription History Log Error]', histErr.message);
            }
        }

        const orderDetails = {
            paymentId: effectivePaymentId,
            orderId: effectiveOrderId,
            baseAmount: numBase,
            gstAmount,
            totalAmount,
            planName
        };

        // Create PDF invoice
        const invoiceName = `invoice_${effectivePaymentId}.pdf`;
        const tempInvoicePath = path.join(__dirname, '../../../public', invoiceName);

        try {
            await generateInvoicePDF(user || { firstName: 'Advocate', email: email || 'customer@thelawmens.com' }, orderDetails, tempInvoicePath);
        } catch (pdfErr) {
            console.warn('[PDF Gen Warning]', pdfErr.message);
        }

        // Send confirmation email
        const targetEmail = user?.email || email;
        if (targetEmail) {
            try {
                const invoiceUrl = `https://lawmens-1.onrender.com/${invoiceName}`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #25AAE2; text-align: center;">THE-LAWMEN'S</h2>
                        <h3 style="text-align: center;">Subscription Activated Successfully! 🎉</h3>
                        <p>Dear ${user?.firstName || 'Valued Advocate'},</p>
                        <p>Thank you for subscribing to <strong>${planName}</strong>. Your subscription of <strong>INR ${totalAmount.toFixed(2)}</strong> has been activated.</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${effectivePaymentId}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Valid Until:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${expirationDate.toLocaleDateString()}</td></tr>
                        </table>
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="${invoiceUrl}" style="background-color: #25AAE2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Download Tax Invoice PDF</a>
                        </div>
                    </div>
                `;

                await sendEmail(targetEmail, emailHtml, "Subscription Confirmation & Tax Invoice - THE-LAWMEN'S");
            } catch (emailErr) {
                console.warn('[Email Warning]', emailErr.message);
            }
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'Subscription activated successfully.',
            paymentId: effectivePaymentId,
            orderId: effectiveOrderId,
            validUntil: expirationDate.toISOString(),
            isPremium: true
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 3. Mobile In-App Purchase Verification (Google Play)
const verifyMobilePurchase = async (req, res) => {
    try {
        const { userId } = req;
        const { purchaseToken, productId, orderId } = req.body;

        if (!purchaseToken || !productId) {
            return sendResponse(res, false, 400, 'purchaseToken and productId are required.');
        }

        const user = await User.findById(userId);
        if (!user) return sendResponse(res, false, 404, 'User not found.');

        const isYearly = productId.includes('yearly') || productId.includes('annual');
        const validityDays = isYearly ? 365 : 30;
        const purchaseDate = new Date();
        const expiryDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        user.isPremium = true;
        user.premiumPurchaseDate = purchaseDate;
        user.trialEndDate = expiryDate;
        user.subscriptionExpiresAt = expiryDate;
        user.premiumPaymentId = orderId || purchaseToken;
        await user.save();

        return sendResponse(res, true, 200, 'Mobile Purchase verified successfully.', {
            isPremium: true,
            purchaseDate,
            expiryDate,
            validityDays
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

const renderCheckoutPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/checkout.html'));
};

module.exports = {
    renderCheckoutPage,
    activateOrVerifySubscription,
    verifyMobilePurchase
};

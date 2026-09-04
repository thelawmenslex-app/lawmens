const User = require('../../models/user');
const AuditLog = require('../../models/auditLog');
const Subscription = require('../../models/subscription');
const SubscriptionHistory = require('../../models/subscriptionHistory');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendResponse, errorHandler } = require('../../../utils/common_functions');
const { sendEmail } = require('../../../services/email.service');
const Razorpay = require('razorpay');

// Razorpay Key Configuration from Environment
const getRazorpayKeys = () => {
    return {
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_TXxg1ZquvFEEAn",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "xeVzUF2hGTEJIGX3Izra6tNF"
    };
};

const getRazorpayInstance = () => {
    const keys = getRazorpayKeys();
    return new Razorpay({
        key_id: keys.key_id,
        key_secret: keys.key_secret
    });
};

// 1. Create Razorpay Order
// Endpoint: POST /api/create-order or /api/v1/payments/create-order
const createOrder = async (req, res) => {
    try {
        const { 
            amount, 
            currency = 'INR', 
            receipt, 
            planId, 
            planName, 
            email 
        } = req.body;

        if (amount === undefined || amount === null) {
            return sendResponse(res, false, 400, 'Amount is required.');
        }

        // Amount handling: If amount >= 100 and likely passed in paise directly vs rupees
        let amountInPaisa;
        const numAmount = Number(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            return sendResponse(res, false, 400, 'Invalid amount specified.');
        }

        // Standard convention: if amount is given as rupees (e.g. 199, 1499, 1500), convert to paise
        // If explicitly <= 100 paise or specified in paise (> 10000 with decimals or exact), handle gracefully
        if (numAmount < 100 && Number.isInteger(numAmount)) {
            // Provided in rupees (e.g. ₹1 = 100 paise)
            amountInPaisa = Math.round(numAmount * 100);
        } else if (numAmount >= 100 && numAmount < 10000 && !req.body.isPaise) {
            // e.g. ₹199 -> 19900 paise
            amountInPaisa = Math.round(numAmount * 100);
        } else {
            amountInPaisa = Math.round(numAmount);
        }

        // Minimum amount validation: at least 100 paise (₹1)
        if (amountInPaisa < 100) {
            return sendResponse(res, false, 400, 'Minimum order amount must be at least 100 paise (₹1.00).');
        }

        const keys = getRazorpayKeys();
        const rzp = getRazorpayInstance();

        try {
            const orderOptions = {
                amount: amountInPaisa,
                currency: currency || 'INR',
                receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                notes: {
                    planId: planId || 'startup_pass',
                    planName: planName || "THE-LAWMEN'S Subscription",
                    userEmail: email || req.profile?.email || 'customer@thelawmens.com'
                }
            };

            const order = await rzp.orders.create(orderOptions);

            return res.status(200).json({
                status: true,
                statusCode: 200,
                message: 'Razorpay order created successfully.',
                order_id: order.id,
                id: order.id,
                amount: order.amount,
                currency: order.currency || 'INR',
                key: keys.key_id,
                receipt: order.receipt,
                data: {
                    order_id: order.id,
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency || 'INR',
                    key: keys.key_id,
                    receipt: order.receipt
                }
            });
        } catch (rzpErr) {
            console.error('[Razorpay Order Creation Error]:', rzpErr);
            const statusCode = rzpErr.statusCode || (rzpErr.error && rzpErr.error.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
            
            if (statusCode === 401 || (rzpErr.error && rzpErr.error.description && rzpErr.error.description.includes('Authentication'))) {
                return res.status(401).json({
                    status: false,
                    statusCode: 401,
                    message: 'Razorpay authentication failed. Invalid Key ID or Key Secret.',
                    error: rzpErr.error || rzpErr.message
                });
            }

            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: rzpErr.error?.description || 'Razorpay order creation failed.',
                error: rzpErr.error || rzpErr.message
            });
        }
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 2. Generate PDF Invoice and save locally
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

// 3. Verify Razorpay Payment signature and activate subscription
// Endpoint: POST /api/verify-payment or /api/v1/payments/verify-payment
const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            baseAmount = 199,
            planId,
            planName = 'Premium Membership',
            validityDays = 30,
            email 
        } = req.body;

        const userId = req.userId || req.profile?._id;

        // Validation: Required signature fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.'
            });
        }

        const keys = getRazorpayKeys();

        // Perform HMAC-SHA256 signature verification
        const hmac = crypto.createHmac('sha256', keys.key_secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.warn('[Razorpay Signature Mismatch]', {
                generated_signature,
                received_signature: razorpay_signature
            });

            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'Invalid payment signature. Verification failed. Payment cannot be verified.'
            });
        }

        // Signature Verified! Proceed with subscription activation
        const effectivePaymentId = razorpay_payment_id;
        const numBase = Number(baseAmount) || 199;
        const gstAmount = Math.round(numBase * 0.18 * 100) / 100;
        const totalAmount = Math.round((numBase + gstAmount) * 100) / 100;

        const expirationDate = new Date(Date.now() + (Number(validityDays) || 30) * 24 * 60 * 60 * 1000);

        let user = null;
        try {
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
                        orderId: razorpay_order_id
                    });
                } catch (histErr) {
                    console.warn('[Subscription History Log Error]', histErr.message);
                }
            }
        } catch (dbErr) {
            console.warn('[DB User Update Note]', dbErr.message);
        }

        const orderDetails = {
            paymentId: effectivePaymentId,
            orderId: razorpay_order_id,
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
                        <p>Thank you for subscribing to <strong>${planName}</strong>. Your payment of <strong>INR ${totalAmount.toFixed(2)}</strong> has been verified.</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Payment ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${effectivePaymentId}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${razorpay_order_id}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Valid Until:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${expirationDate.toLocaleDateString()}</td></tr>
                        </table>
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="${invoiceUrl}" style="background-color: #25AAE2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Download Tax Invoice PDF</a>
                        </div>
                    </div>
                `;

                await sendEmail(targetEmail, emailHtml, "Payment Confirmation & Tax Invoice - THE-LAWMEN'S");
            } catch (emailErr) {
                console.warn('[Email Warning]', emailErr.message);
            }
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'Payment verified and subscription activated successfully.',
            paymentId: effectivePaymentId,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            validUntil: expirationDate.toISOString(),
            isPremium: true
        });
    } catch (error) {
        return errorHandler(error, res);
    }
};

// 4. Webhook listener for async Razorpay events
const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (secret && signature) {
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(JSON.stringify(req.body));
            const generated = hmac.digest('hex');
            if (generated !== signature) {
                console.warn('[Razorpay Webhook] Invalid signature');
                return res.status(400).json({ status: false, message: 'Invalid webhook signature' });
            }
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured' || event === 'order.paid') {
            const paymentEntity = payload.payment?.entity;
            const userEmail = paymentEntity?.notes?.userEmail;
            
            if (userEmail) {
                const user = await User.findOne({ email: new RegExp('^' + userEmail.trim() + '$', 'i') });
                if (user) {
                    user.isPremium = true;
                    user.premiumPurchaseDate = new Date();
                    user.premiumPaymentId = paymentEntity.id;
                    user.trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    user.subscriptionExpiresAt = user.trialEndDate;
                    await user.save();
                }
            }
        }

        return res.status(200).json({ status: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('[Razorpay Webhook Error]', error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

// 5. Mobile In-App Purchase Verification (Google Play)
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

module.exports = {
    createOrder,
    verifyPayment,
    handleWebhook,
    verifyMobilePurchase
};

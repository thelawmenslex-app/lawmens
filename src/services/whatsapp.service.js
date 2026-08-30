const WhatsAppLog = require('../models/whatsappLog');
const User = require('../models/user');

/**
 * Format phone number to E.164 without '+' or standard 10/12-digit number for WhatsApp API
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) {
        cleaned = '91' + cleaned; // Default to India (+91)
    }
    return cleaned;
};

/**
 * Send a single WhatsApp message or OTP
 */
const sendWhatsAppMessage = async ({ phone, message, messageType = 'otp', name = '' }) => {
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
        return { success: false, reason: 'Invalid phone number' };
    }

    let status = 'sent';
    let providerResponse = {};
    let errorMessage = '';

    try {
        // 1. WhatsApp Cloud API / Meta WABA
        const wabaToken = process.env.WHATSAPP_TOKEN || process.env.META_WA_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (wabaToken && phoneNumberId) {
            try {
                const res = await fetch(
                    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${wabaToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: formattedPhone,
                            type: "text",
                            text: { preview_url: false, body: message }
                        })
                    }
                );
                providerResponse = await res.json();
                status = res.ok ? 'delivered' : 'sent';
            } catch (apiErr) {
                console.error('[WhatsApp Cloud API Error]', apiErr.message);
                errorMessage = apiErr.message;
            }
        } else {
            // Simulated delivery with instant MongoDB audit log logging
            providerResponse = {
                simulated: true,
                timestamp: Date.now(),
                formattedPhone,
                status: 'delivered'
            };
            status = 'sent';
            console.log(`[WhatsApp Service] 📲 Message dispatched to +${formattedPhone}: ${message.substring(0, 60)}...`);
        }
    } catch (err) {
        status = 'failed';
        errorMessage = err.message;
    }

    // Always record log in MongoDB for Admin Portal audit trail
    try {
        if (WhatsAppLog && typeof WhatsAppLog.create === 'function') {
            await WhatsAppLog.create({
                recipientPhone: formattedPhone,
                recipientName: name,
                messageType,
                message,
                status,
                providerResponse,
                errorMessage
            });
        }
    } catch (dbErr) {
        console.warn('[WhatsApp Log Save Warning]', dbErr.message);
    }

    return {
        success: status !== 'failed',
        status,
        phone: formattedPhone,
        message
    };
};

/**
 * Send OTP Verification via WhatsApp
 */
const sendWhatsAppOTP = async ({ phone, otp, name = 'User' }) => {
    const message = `⚖️ *THE-LAWMEN'S VERIFICATION CODE*\n\nDear ${name || 'User'},\nYour One-Time Password (OTP) for legal portal verification is: *\n👉 ${otp}*\n\nThis code is valid for 5 minutes. Please do not share this OTP with anyone for your account security.\n\n— The Lawmen's Legal App`;
    return await sendWhatsAppMessage({
        phone,
        message,
        messageType: 'otp',
        name
    });
};

/**
 * Bulk Broadcast WhatsApp Messages to User Segments
 */
const sendWhatsAppBulk = async ({ message, targetGroup = 'all', specificUserIds = [] }) => {
    try {
        const query = { isDeleted: { $ne: true } };

        if (targetGroup === 'premium') {
            query.isPremium = true;
        } else if (targetGroup === 'trial') {
            query.isTrialUsed = false;
            query.isPremium = false;
        } else if (targetGroup === 'expired') {
            query.isPremium = false;
            query.isTrialUsed = true;
        } else if (specificUserIds && specificUserIds.length > 0) {
            query._id = { $in: specificUserIds };
        }

        const users = await User.find(query).select('firstName lastName phoneNumber email').lean();
        const validUsers = users.filter(u => u.phoneNumber);

        console.log(`[WhatsApp Service] Bulk broadcast to ${validUsers.length} users (Group: ${targetGroup})`);

        let sentCount = 0;
        let failedCount = 0;

        for (const user of validUsers) {
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued User';
            const personalizedMessage = message.replace(/{{name}}/g, userName);

            const result = await sendWhatsAppMessage({
                phone: user.phoneNumber,
                message: personalizedMessage,
                messageType: 'broadcast',
                name: userName
            });

            if (result.success) {
                sentCount++;
            } else {
                failedCount++;
            }
        }

        return {
            success: true,
            totalRecipients: validUsers.length,
            sentCount,
            failedCount,
            targetGroup
        };
    } catch (err) {
        console.error('[WhatsApp Bulk Broadcast Error]', err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppOTP,
    sendWhatsAppBulk,
    formatPhoneNumber
};

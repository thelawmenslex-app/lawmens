const axios = require('axios');
const User = require('../models/user');

/**
 * Send real FCM System Push Notification Banner to user devices.
 * Uses FCM Server Key / Legacy HTTP Protocol for immediate push delivery.
 */
const sendFcmPushToTokens = async ({ title, message, targetGroup, targetUserId, dataPayload = {} }) => {
    try {
        // Build user query for active device tokens
        const userQuery = {
            isDeleted: { $ne: true },
            fcmToken: { $ne: null, $exists: true }
        };

        if (targetGroup === 'premium') {
            userQuery.isPremium = true;
        } else if (targetGroup === 'trial') {
            userQuery.isTrialUsed = false;
            userQuery.isPremium = false;
        } else if (targetGroup === 'expired') {
            userQuery.isPremium = false;
            userQuery.isTrialUsed = true;
        } else if (targetUserId) {
            userQuery._id = targetUserId;
        }

        const users = await User.find(userQuery).select('fcmToken email').lean();
        const tokens = users.map(u => u.fcmToken).filter(Boolean);

        if (!tokens || tokens.length === 0) {
            console.log('[FCM Service] No registered device tokens found for push notification broadcast.');
            return { success: false, deliveredCount: 0, reason: 'No registered FCM tokens found' };
        }

        const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
        if (!fcmServerKey) {
            console.log('[FCM Service] FCM_SERVER_KEY environment variable is not set. Token count:', tokens.length);
            return { success: false, deliveredCount: 0, reason: 'FCM_SERVER_KEY missing in environment variables' };
        }

        let successCount = 0;
        // Batch push requests to FCM
        for (const token of tokens) {
            try {
                const response = await axios.post(
                    'https://fcm.googleapis.com/fcm/send',
                    {
                        to: token,
                        priority: 'high',
                        notification: {
                            title: title,
                            body: message,
                            sound: 'default',
                            badge: '1',
                            android_channel_id: 'lawapp_default_channel'
                        },
                        data: {
                            title: title,
                            message: message,
                            click_action: 'FLUTTER_NOTIFICATION_CLICK',
                            ...dataPayload
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `key=${fcmServerKey}`
                        },
                        timeout: 5000
                    }
                );

                if (response?.data?.success === 1 || response?.status === 200) {
                    successCount++;
                }
            } catch (singleErr) {
                console.log(`[FCM Service] Failed to send push token to ${token.substring(0, 10)}...`, singleErr?.message);
            }
        }

        console.log(`[FCM Service] Sent push notification banner to ${successCount} / ${tokens.length} devices.`);
        return { success: true, deliveredCount: successCount, totalTokens: tokens.length };
    } catch (error) {
        console.error('[FCM Service Error]:', error?.message);
        return { success: false, error: error?.message };
    }
};

module.exports = {
    sendFcmPushToTokens
};

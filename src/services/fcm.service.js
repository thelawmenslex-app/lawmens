const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/user');

/**
 * Generate Google OAuth2 Access Token using FIREBASE_SERVICE_ACCOUNT
 */
const getGoogleAccessToken = (serviceAccount) => {
    return new Promise((resolve, reject) => {
        try {
            const header = { alg: 'RS256', typ: 'JWT' };
            const now = Math.floor(Date.now() / 1000);
            const claimSet = {
                iss: serviceAccount.client_email,
                scope: 'https://www.googleapis.com/auth/firebase.messaging',
                aud: 'https://oauth2.googleapis.com/token',
                exp: now + 3600,
                iat: now
            };

            const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
            const encodedClaimSet = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
            const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

            const signer = crypto.createSign('RSA-SHA256');
            signer.update(signatureInput);
            const signature = signer.sign(serviceAccount.private_key, 'base64url');
            const jwt = `${signatureInput}.${signature}`;

            axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 10000
            }).then(res => resolve(res.data.access_token)).catch(err => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Send real FCM System Push Notification Banner to user devices.
 * Supports FIREBASE_SERVICE_ACCOUNT (FCM HTTP v1) & Legacy FCM_SERVER_KEY.
 */
const sendFcmPushToTokens = async ({ title, message, targetGroup, targetUserId, dataPayload = {} }) => {
    try {
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

        // 1. Try FIREBASE_SERVICE_ACCOUNT (Modern FCM v1 API)
        let serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccountRaw) {
            try {
                const serviceAccount = typeof serviceAccountRaw === 'string' ? JSON.parse(serviceAccountRaw) : serviceAccountRaw;
                const accessToken = await getGoogleAccessToken(serviceAccount);
                const projectId = serviceAccount.project_id || "the-lawmens";

                let successCount = 0;
                for (const token of tokens) {
                    try {
                        const response = await axios.post(
                            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                            {
                                message: {
                                    token: token,
                                    notification: {
                                        title: title,
                                        body: message
                                    },
                                    data: {
                                        title: title,
                                        message: message,
                                        ...dataPayload
                                    },
                                    android: {
                                        priority: 'high',
                                        notification: {
                                            sound: 'default',
                                            channel_id: 'lawapp_default_channel'
                                        }
                                    }
                                }
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${accessToken}`
                                },
                                timeout: 8000
                            }
                        );
                        if (response?.status === 200) successCount++;
                    } catch (singleErr) {
                        console.log(`[FCM v1 Service] Token Error: ${token.substring(0, 10)}...`, singleErr?.response?.data || singleErr?.message);
                    }
                }
                console.log(`[FCM Service] Sent FCM v1 push notification banner to ${successCount} / ${tokens.length} devices.`);
                return { success: true, deliveredCount: successCount, totalTokens: tokens.length };
            } catch (v1Err) {
                console.error('[FCM Service] FIREBASE_SERVICE_ACCOUNT Auth Error:', v1Err?.response?.data || v1Err?.message);
            }
        }

        // 2. Fallback to FCM Legacy Server Key
        const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
        if (fcmServerKey) {
            let successCount = 0;
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
                                badge: '1'
                            },
                            data: {
                                title: title,
                                message: message,
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
                    if (response?.data?.success === 1 || response?.status === 200) successCount++;
                } catch (singleErr) {
                    console.log(`[FCM Legacy Service] Token Error: ${token.substring(0, 10)}...`, singleErr?.message);
                }
            }
            console.log(`[FCM Legacy Service] Sent push notification banner to ${successCount} / ${tokens.length} devices.`);
            return { success: true, deliveredCount: successCount, totalTokens: tokens.length };
        }

        return { success: false, deliveredCount: 0, reason: 'No valid FCM Service Account or Server Key configured.' };
    } catch (error) {
        console.error('[FCM Service Error]:', error?.message);
        return { success: false, error: error?.message };
    }
};

module.exports = {
    sendFcmPushToTokens
};

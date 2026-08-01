const axios = require('axios');
const Sib = require('sib-api-v3-sdk');

/**
 * Send Transactional Email & Signup OTP via Brevo.com API v3
 */
const sendEmail = async (sendTo, htmlContent, subject, content, attachment, status) => {
    try {
        const apiKey = process.env.BREVO_API_KEY || process.env.EMAILSECRET || process.env.SENDINBLUE_API_KEY || process.env.SIB_API_KEY;

        if (!apiKey) {
            console.error('[Brevo Email Service] Error: No Brevo API Key found in environment variables (BREVO_API_KEY / EMAILSECRET).');
            return { status: false, message: 'Brevo API key missing' };
        }

        // Format recipient list
        let formattedRecipients = [];
        if (Array.isArray(sendTo)) {
            formattedRecipients = sendTo.map(item => typeof item === 'string' ? { email: item } : item);
        } else if (typeof sendTo === 'string') {
            formattedRecipients = [{ email: sendTo }];
        } else {
            formattedRecipients = [sendTo];
        }

        const senderName = process.env.BREVO_SENDER_NAME || "THE-LAWMEN'S";
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || "appmagicsector@gmail.com";

        const payload = {
            sender: { name: senderName, email: senderEmail },
            to: formattedRecipients,
            subject: subject || "OTP Verification - THE-LAWMEN'S",
            htmlContent: htmlContent
        };

        if (content) {
            payload.textContent = content;
        }

        if (attachment) {
            const fileName = attachment.split('/');
            payload.attachment = [{ url: attachment, name: fileName[fileName.length - 1] }];
        }

        // 1. Send via Brevo REST API v3
        try {
            const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json'
                },
                timeout: 10000
            });

            console.log('[Brevo Email Service] OTP email sent successfully via Brevo API:', response.data?.messageId || response.status);
            return response.data;
        } catch (restErr) {
            console.warn('[Brevo REST API warning, trying SDK fallback]:', restErr?.response?.data || restErr?.message);
        }

        // 2. Fallback to sib-api-v3-sdk
        const client = Sib.ApiClient.instance;
        const apiKeyAuth = client.authentications['api-key'];
        apiKeyAuth.apiKey = apiKey;

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const options = {
            sender: { name: senderName, email: senderEmail },
            to: formattedRecipients,
            subject: subject,
            htmlContent: htmlContent
        };

        const result = await tranEmailApi.sendTransacEmail(options);
        console.log('[Brevo SDK] Sent email via SIB SDK successfully.');
        return result;
    } catch (error) {
        console.error('[Brevo Email Service Error]:', error?.response?.data || error?.message);
        throw error;
    }
};

module.exports = { sendEmail };

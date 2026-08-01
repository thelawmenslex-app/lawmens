const nodemailer = require('nodemailer');
const axios = require('axios');
const Sib = require('sib-api-v3-sdk');

/**
 * Send Signup OTP & Email Verification via Firebase Auth, Nodemailer, or Brevo
 */
const sendEmail = async (sendTo, htmlContent, subject, content, attachment, status) => {
    try {
        const recipientEmail = Array.isArray(sendTo) ? (sendTo[0]?.email || sendTo[0]) : sendTo;

        // 1. Send via Nodemailer SMTP if credentials configured in environment
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: Number(process.env.SMTP_PORT) || 465,
                    secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                const mailOptions = {
                    from: `"THE-LAWMEN'S" <${process.env.SMTP_USER}>`,
                    to: recipientEmail,
                    subject: subject || "OTP Verification - THE-LAWMEN'S",
                    html: htmlContent
                };

                const info = await transporter.sendMail(mailOptions);
                console.log('[Nodemailer SMTP] Sent OTP email successfully to', recipientEmail, 'MessageId:', info.messageId);
                return info;
            } catch (smtpErr) {
                console.warn('[Nodemailer SMTP warning]:', smtpErr.message);
            }
        }

        // 2. Send via Brevo API v3 if a valid non-placeholder API key is configured
        const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || process.env.SIB_API_KEY || (process.env.EMAILSECRET && process.env.EMAILSECRET.length > 20 ? process.env.EMAILSECRET : null);

        if (apiKey && apiKey !== 'emailsecretkey') {
            const senderName = process.env.BREVO_SENDER_NAME || "THE-LAWMEN'S";
            const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || "appmagicsector@gmail.com";

            const payload = {
                sender: { name: senderName, email: senderEmail },
                to: [{ email: recipientEmail }],
                subject: subject || "OTP Verification - THE-LAWMEN'S",
                htmlContent: htmlContent
            };

            try {
                const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
                    headers: {
                        'accept': 'application/json',
                        'api-key': apiKey,
                        'content-type': 'application/json'
                    },
                    timeout: 10000
                });
                console.log('[Brevo API] Sent OTP email successfully:', response.data?.messageId || response.status);
                return response.data;
            } catch (restErr) {
                console.warn('[Brevo API warning]:', restErr?.response?.data || restErr?.message);
            }
        }

        // 3. Send via Firebase Auth Identity Toolkit API
        const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY || "AIzaSyBLc-ePPiNr5XhQSHKV0GdArM-BYMM0VhI";
        if (firebaseApiKey) {
            try {
                let idToken = null;
                try {
                    const signUpRes = await axios.post(
                        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`,
                        {
                            email: recipientEmail,
                            password: `TempP@ss_${Date.now()}`,
                            returnSecureToken: true
                        },
                        { timeout: 5000 }
                    );
                    idToken = signUpRes.data?.idToken;
                } catch (signUpErr) {
                    const resetRes = await axios.post(
                        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
                        {
                            requestType: "PASSWORD_RESET",
                            email: recipientEmail
                        },
                        { timeout: 5000 }
                    );
                    console.log('[Firebase Auth Email] Sent Email Verification via Firebase:', resetRes.data);
                    return resetRes.data;
                }

                if (idToken) {
                    const verifyRes = await axios.post(
                        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`,
                        {
                            requestType: "VERIFY_EMAIL",
                            idToken: idToken
                        },
                        { timeout: 5000 }
                    );
                    console.log('[Firebase Auth Email] Sent verification email via Firebase:', verifyRes.data);
                    return verifyRes.data;
                }
            } catch (fbErr) {
                console.warn('[Firebase Auth Email Notice]:', fbErr?.response?.data?.error?.message || fbErr?.message);
            }
        }

        console.warn('[Email Service Notice] No active email credentials (SMTP/Brevo/Firebase) succeeded.');
        return { status: false, message: 'No live email credentials configured' };
        return { status: false, message: 'No live email credentials configured' };
    } catch (error) {
        console.error('[Email Service Error]:', error?.message);
        return { status: false, message: error.message };
    }
};

module.exports = { sendEmail };

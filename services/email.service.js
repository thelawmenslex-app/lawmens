const nodemailer = require('nodemailer');
const axios = require('axios');
const Sib = require('sib-api-v3-sdk');

/**
 * Send Signup OTP & Transactional Email via Resend.com API, Nodemailer, or Brevo
 */
const sendEmail = async (sendTo, htmlContent, subject, content, attachment, status) => {
    try {
        const recipientEmail = Array.isArray(sendTo) ? (sendTo[0]?.email || sendTo[0]) : sendTo;

        // 1. Send via Resend.com API (Primary Provider)
        const resendApiKey = process.env.RESEND_API_KEY || (process.env.EMAILSECRET && process.env.EMAILSECRET.startsWith('re_') ? process.env.EMAILSECRET : null);
        
        if (resendApiKey) {
            const senderEmail = process.env.RESEND_FROM_EMAIL || "THE-LAWMEN'S <onboarding@resend.dev>";
            try {
                const response = await axios.post(
                    'https://api.resend.com/emails',
                    {
                        from: senderEmail,
                        to: [recipientEmail],
                        subject: subject || "OTP Verification - THE-LAWMEN'S",
                        html: htmlContent
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${resendApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 10000
                    }
                );
                console.log('[Resend Email Service] Sent OTP email successfully via Resend. ID:', response.data?.id);
                return response.data;
            } catch (resendErr) {
                console.warn('[Resend API Error]:', resendErr?.response?.data || resendErr?.message);
            }
        }

        // 2. Send via Nodemailer SMTP if credentials configured in environment
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

        // 3. Send via Brevo API v3 if a valid non-placeholder API key is configured
        const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || process.env.SIB_API_KEY;

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

        console.warn('[Email Service Notice] No active email credentials (Resend/SMTP/Brevo) succeeded.');
        return { status: false, message: 'No live email credentials configured' };
    } catch (error) {
        console.error('[Email Service Error]:', error?.message);
        return { status: false, message: error.message };
    }
};

module.exports = { sendEmail };

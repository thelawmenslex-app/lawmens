const cron = require('node-cron');
const User = require('../src/models/user');
const PushNotification = require('../src/models/pushNotification');
const { sendEmail } = require('./email.service');

const sendScheduledNotifications = async () => {
    try {
        const now = new Date();
        const pendingNotices = await PushNotification.find({
            status: 'scheduled',
            scheduledAt: { $lte: now }
        });
        
        if (pendingNotices.length > 0) {
            console.log(`[Notification Service] Found ${pendingNotices.length} scheduled notifications to process.`);
            for (const notif of pendingNotices) {
                notif.status = 'sent';
                notif.sentAt = now;
                await notif.save();
                console.log(`[Notification Service] Sent scheduled notification: "${notif.title}"`);
            }
        }
    } catch (err) {
        console.error('[Notification Service] Error running scheduled notifications cron:', err.message);
    }
};

const runRemindersCheck = async () => {
    console.log('[Reminder Service] Checking for trial expiration reminders...');
    try {
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        const users = await User.find({
            isPremium: { $ne: true },
            role: 'User',
            trialEndDate: { $exists: true, $ne: null }
        });

        for (const user of users) {
            const diffTime = new Date(user.trialEndDate).getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / oneDayMs);
            
            if (diffDays === 1 || diffDays === 2) {
                const html = `
                    <h2>Hello ${user.firstName || 'User'},</h2>
                    <p>This is a reminder that your 7-day free trial on the **THE-LAWMEN'S Law App** expires in <b>${diffDays} day(s)</b>.</p>
                    <p>To avoid any disruption to offline access, notes synchronization, and voice search features, upgrade to lifetime premium access for a one-time payment of only ₹999.</p>
                    <br/>
                    <p>Best regards,<br/>The Lawmen's Team</p>
                `;
                
                try {
                    await sendEmail(user.email, html, `Your Law App Trial Expires in ${diffDays} Day(s)! ⚖️`);
                    console.log(`[Reminder Service] Sent trial warning to ${user.email} (${diffDays} days remaining).`);
                } catch (emailErr) {
                    console.error(`[Reminder Service] Failed to send email to ${user.email}:`, emailErr.message);
                }
            }
        }
        console.log('[Reminder Service] Trial check finished.');
    } catch (err) {
        console.error('[Reminder Service] Error during check:', err.message);
    }
};

const subscriptionCron = () => {
    // Run once at startup
    runRemindersCheck();
    sendScheduledNotifications();

    // Schedule daily check at midnight
    cron.schedule('0 0 * * *', () => {
        runRemindersCheck();
    });

    // Schedule push notification check every minute
    cron.schedule('* * * * *', () => {
        sendScheduledNotifications();
    });
};

module.exports = {
    subscriptionCron
};

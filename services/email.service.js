const Sib = require('sib-api-v3-sdk');
const sendEmail = async (sendTo, htmlContent, subject, content, attachment, status) => {
    const appEnvironment = process.env.NODE_ENV;
    let mail;
    if (!Array.isArray(sendTo)) {
        sendTo = [{ email: sendTo }];
    }
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.EMAILSECRET;
    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
        name: "law app",
        email: "appmagicsector@gmail.com"
    };
    const options = {
        sender: sender,
        to: sendTo,
        subject: subject,
        // textContent: content,
        htmlContent: htmlContent,
    };
    if (content) {
        options.textContent = content;
    }
    if (attachment) {
        const attachmentUrl = attachment;
        const fileName = attachment.split('/');
        options.attachment = [{ url: attachmentUrl, name: fileName[fileName.length - 1] }];
        delete options.textContent;
    }
    mail = await tranEmailApi.sendTransacEmail(options);


    return mail;
};

module.exports = { sendEmail };

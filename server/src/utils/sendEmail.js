const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    let transporter;

    // If real SMTP credentials are provided in .env, use them to send real emails
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // Use a 16-character Google App Password here, NOT your real password
        },
      });
    } else {
      // Fallback: Generate test SMTP service account from ethereal.email (Fake emails for testing)
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"BuildTrack AI" <no-reply@buildtrack.ai>',
      to,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
    
    // Preview only available when sending through an Ethereal test account
    if (!process.env.SMTP_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
};

module.exports = sendEmail;

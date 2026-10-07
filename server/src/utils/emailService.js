const nodemailer = require('nodemailer');

// Use environment variables for real SMTP, fallback to ethereal for dev/testing
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail', // or configured host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback for development if no real credentials are provided
  console.log('⚠️ No EMAIL_USER/EMAIL_PASS found in .env. Using Ethereal Email for testing.');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: '"Kreo Platform" <noreply@kreoplatform.com>',
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${to}: ${subject}`);
    
    // Log Ethereal URL if using test account
    if (info.messageId && !process.env.EMAIL_USER) {
      console.log(`🔗 PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

exports.sendApprovalEmail = async (to, companyName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #059669;">Welcome to BuildTrack AI, ${companyName}!</h2>
      <p style="color: #475569; font-size: 16px;">Great news! Your company registration has been reviewed and <strong>APPROVED</strong> by the platform administrators.</p>
      <p style="color: #475569; font-size: 16px;">You can now log in to the BuildTrack AI Platform and start managing your construction projects, teams, and materials.</p>
      <div style="margin: 30px 0;">
        <a href="http://localhost:3000/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">If you have any questions, please contact support.</p>
    </div>
  `;
  return sendEmail(to, 'Your BuildTrack AI Account is Approved!', html);
};

exports.sendRejectionEmail = async (to, companyName, reason) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #dc2626;">Registration Update: ${companyName}</h2>
      <p style="color: #475569; font-size: 16px;">We have reviewed your registration application for the Kreo Platform.</p>
      <p style="color: #475569; font-size: 16px;">Unfortunately, your application has been <strong>DECLINED</strong> at this time.</p>
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2; margin: 20px 0;">
        <h4 style="color: #991b1b; margin-top: 0;">Reason for Rejection:</h4>
        <p style="color: #b91c1c; margin-bottom: 0; font-style: italic;">"${reason}"</p>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">Please correct these issues and submit a new registration request, or contact our support team for clarification.</p>
    </div>
  `;
  return sendEmail(to, 'Kreo Registration Update', html);
};

exports.sendVerificationEmail = async (to, companyName, link) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0f172a;">Verify your Kreo Account</h2>
      <p style="color: #475569; font-size: 16px;">Hello ${companyName},</p>
      <p style="color: #475569; font-size: 16px;">Thank you for registering on the Kreo Platform. Please verify your email address so our administrators can review your application.</p>
      <div style="margin: 30px 0;">
        <a href="${link}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="color: #94a3b8; font-size: 14px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail(to, 'Verify your Kreo Registration', html);
};

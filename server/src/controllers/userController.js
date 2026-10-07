const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: req.user?.companyId ? { companyId: req.user.companyId } : {},
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove passwords from response
    const safeUsers = users.map(u => {
      const { password, verificationCode, ...rest } = u;
      return rest;
    });

    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Only company admins can invite users.' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

        // Generate secure setup token instead of temp password
    const crypto = require('crypto');
    const setupToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate impossible placeholder password since schema requires it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: req.user.companyId,
        isEmailVerified: false,
        verificationCode: setupToken,
        verificationCodeExpires: tokenExpires
      }
    });

    // Send email with setup link
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const companyName = company ? company.name : 'your company';
    
    const setupLink = `http://localhost:3000/setup-account?token=${setupToken}&email=${encodeURIComponent(email)}`;

    const emailSent = await sendEmail({
      to: email,
      subject: `Invitation to Kreo - ${companyName}`,
      text: `Hello ${name},\n\nYou have been invited by ${companyName} to join Kreo as a ${role.replace('_', ' ')}.\n\nPlease click the link below to verify your email and set up your secure password:\n\n${setupLink}\n\nThis link will expire in 24 hours.\n\nAlternatively, you can sign in using Google SSO with this email address.`
    });

    const { password, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser, emailSent });

  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};




exports.setupPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verificationCode !== token) {
      return res.status(400).json({ success: false, message: 'Invalid or expired setup token' });
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Setup token has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }
    });

    res.json({ success: true, message: 'Password set successfully. You can now log in.' });
  } catch (error) {
    console.error('Error setting up password:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verificationCode !== token) {
      return res.status(400).json({ success: false, message: 'Invalid setup token' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        verificationCode: null,
      }
    });

    res.status(200).json({ success: true, message: 'Email successfully verified' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

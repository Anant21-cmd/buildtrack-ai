const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id.apps.googleusercontent.com');

// 1. Seed initial Super Admin if not exists
exports.seedSuperAdmin = async (req, res, next) => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingAdmin) {
      return res.status(200).json({ message: 'Super Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('lathianand', 10);

    const superAdmin = await prisma.user.create({
      data: {
        name: 'Anand',
        email: 'anand@kreo.ai',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        avatar: 'AN',
        isEmailVerified: true
      }
    });

    res.status(201).json({ message: 'Super Admin created successfully', user: { id: superAdmin.id, email: superAdmin.email } });
  } catch (error) {
    next(error);
  }
};



// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 2. Login
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ message: 'Account not verified. Please check your email for the setup link.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid login credentials' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (!user.company) {
        return res.status(401).json({ message: 'User is not assigned to a company' });
      }
      if (user.company.status === 'PENDING') return res.status(401).json({ message: 'Company is waiting for approval' });
      if (user.company.status === 'REJECTED') return res.status(401).json({ message: 'Company registration was rejected' });
      if (user.company.status === 'SUSPENDED') return res.status(401).json({ message: 'Company account is currently suspended' });
    }

    // Generate JWT (Expire in 30d if rememberMe, else 1d)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    const { password: _, verificationCode, verificationCodeExpires, ...safeUser } = user;
    res.status(200).json({ success: true, token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 4. Google SSO Login

exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    
    // Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id.apps.googleusercontent.com',
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'No corporate account found for this Google email. Please ask your administrator for an invite.' });
    }

    if (user.role !== 'SUPER_ADMIN') {
      if (!user.company) {
        return res.status(401).json({ message: 'User is not assigned to a company' });
      }
      if (user.company.status === 'PENDING') return res.status(401).json({ message: 'Company is waiting for approval' });
      if (user.company.status === 'REJECTED') return res.status(401).json({ message: 'Company registration was rejected' });
      if (user.company.status === 'SUSPENDED') return res.status(401).json({ message: 'Company account is currently suspended' });
    }

    // Auto-verify email if they successfully use Google SSO
    if (!user.isEmailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      });
    }

    // Generate App JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyId: user.companyId,
        company: user.company?.name || 'Kreo Platform HQ',
        companyStatus: user.company?.status || 'APPROVED'
      }
    });

  } catch (error) {
    console.error("Google Auth Backend Error:", error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};




exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak that the user doesn't exist for security
      return res.status(200).json({ success: true, message: 'If an account with that email exists, we sent a password reset link.' });
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: resetToken,
        verificationCodeExpires: tokenExpires
      }
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: 'Kreo - Password Reset Request',
      text: `You requested a password reset.\n\nPlease click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`
    });

    res.status(200).json({ success: true, message: 'If an account with that email exists, we sent a password reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


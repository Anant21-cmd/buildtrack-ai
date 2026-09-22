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
        email: 'anand@buildtrack.ai',
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
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid login credentials' });
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

    // OTP Verification Check
    if (!user.isEmailVerified) {
      const otp = generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationCode: otp, verificationCodeExpires: expires }
      });

      await sendEmail({
        to: user.email,
        subject: 'BuildTrack AI - Verification Code',
        text: `Your login verification code is: ${otp}. It will expire in 10 minutes.`
      });

      return res.status(200).json({
        requiresVerification: true,
        email: user.email,
        message: 'Verification code sent to email'
      });
    }

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
        company: user.company?.name || 'BuildTrack Platform HQ',
        companyStatus: user.company?.status || 'APPROVED'
      }
    });

  } catch (error) {
    next(error);
  }
};



// 3. Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > new Date(user.verificationCodeExpires)) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // OTP is valid
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }
    });

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
        company: user.company?.name || 'BuildTrack Platform HQ',
        companyStatus: user.company?.status || 'APPROVED'
      }
    });
  } catch (error) {
    next(error);
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
        company: user.company?.name || 'BuildTrack Platform HQ',
        companyStatus: user.company?.status || 'APPROVED'
      }
    });

  } catch (error) {
    console.error("Google Auth Backend Error:", error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};


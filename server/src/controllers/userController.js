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

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: req.user.companyId,
        isEmailVerified: false // Forces OTP on first login
      }
    });

    // Send email
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const companyName = company ? company.name : 'your company';

    const emailSent = await sendEmail({
      to: email,
      subject: `Invitation to BuildTrack AI - ${companyName}`,
      text: `Hello ${name},\n\nYou have been invited by ${companyName} to join BuildTrack AI as a ${role.replace('_', ' ')}.\n\nYour login details are:\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease login at http://localhost:3000/login to access your dashboard.\n\nNote: You will be required to verify your email via OTP upon first login.`
    });

    const { password, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser, emailSent });

  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { sendApprovalEmail, sendRejectionEmail, sendVerificationEmail } = require('../utils/emailService');

// Public Route: Register a new company and its initial Admin
const crypto = require('crypto');
exports.registerCompany = async (req, res, next) => {
  try {
    const { companyName, regNumber, ownerName, email, phone, address, password, documentData } = req.body;

    // Check if company regNumber or email already exists
    const existingCompany = await prisma.company.findFirst({
      where: { OR: [{ regNumber }, { email }] }
    });
    if (existingCompany) return res.status(400).json({ message: 'Company or email already registered' });

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already used for a user account' });

    const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create Company and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newCompany = await tx.company.create({
        data: {
          name: companyName,
          regNumber,
          ownerName,
          email,
          phone,
          address,
          status: 'PENDING',
          documentsSubmitted: documentData ? [documentData] : []
        }
      });

      const newUser = await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
            verificationCode: verificationToken,
          role: 'COMPANY_ADMIN',
          companyId: newCompany.id,
          avatar: ownerName.substring(0, 2).toUpperCase()
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorName: ownerName,
          actorRole: 'COMPANY_ADMIN',
            
          action: 'COMPANY_REGISTERED',
          entity: 'Company',
          entityId: newCompany.id,
          newValue: 'Status: PENDING',
          reason: 'Initial onboarding application'
        }
      });

      return newCompany;
    }, { timeout: 20000 });

    const verifyLink = `http://localhost:3000/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      await sendVerificationEmail(email, companyName, verifyLink);

      res.status(201).json({ message: 'Registration submitted for review', company: result });
  } catch (error) {
    next(error);
  }
};

// Super Admin Route: Get all companies
exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { registeredAt: 'desc' }
    });
    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

// Super Admin Route: Approve Company
exports.approveCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const company = await prisma.company.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), rejectionReason: null }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorName: 'Anand (Super Admin)',
        actorRole: 'SUPER_ADMIN',
        action: 'COMPANY_APPROVED',
        entity: 'Company',
        entityId: id,
        newValue: 'Status: APPROVED',
        reason: 'Manually approved by Super Admin'
      }
    });

    // Send Email Notification
    await sendApprovalEmail(company.email, company.name);

    res.status(200).json({ message: 'Company approved', company });
  } catch (error) {
    next(error);
  }
};

// Super Admin Route: Reject Company
exports.rejectCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const company = await prisma.company.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorName: 'Anand (Super Admin)',
        actorRole: 'SUPER_ADMIN',
        action: 'COMPANY_REJECTED',
        entity: 'Company',
        entityId: id,
        newValue: 'Status: REJECTED',
        reason: reason
      }
    });

    // Send Email Notification
    await sendRejectionEmail(company.email, company.name, reason);

    res.status(200).json({ message: 'Company rejected', company });
  } catch (error) {
    next(error);
  }
};

// Super Admin Route: Get Audit Logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};





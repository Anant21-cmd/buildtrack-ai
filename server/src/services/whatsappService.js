const axios = require('axios');
const fs = require('fs');
const path = require('path');
const baileysService = require('./baileysService');

let runtimeConfig = {
  apiToken: process.env.WHATSAPP_API_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  testPhone: process.env.TEST_WHATSAPP_PHONE || '916382069963',
  enabled: true
};

/**
 * Format phone number to E.164 format without +
 * @param {string} phone 
 * @returns {string}
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

/**
 * Get current configuration
 */
const getWhatsAppConfig = () => {
  const token = runtimeConfig.apiToken || process.env.WHATSAPP_API_TOKEN || '';
  const phoneId = runtimeConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  const isConfigured = !!(token && phoneId);
  const bridge = baileysService.getStatus();

  return {
    isConfigured,
    phoneNumberId: phoneId,
    hasToken: !!token,
    testPhone: runtimeConfig.testPhone || process.env.TEST_WHATSAPP_PHONE || '916382069963',
    mode: bridge.isConnected ? 'real_whatsapp' : (isConfigured ? 'api' : 'link'),
    enabled: runtimeConfig.enabled,
    bridge
  };
};

/**
 * Update configuration dynamically
 */
const updateWhatsAppConfig = (config) => {
  if (config.apiToken !== undefined) runtimeConfig.apiToken = config.apiToken;
  if (config.phoneNumberId !== undefined) runtimeConfig.phoneNumberId = config.phoneNumberId;
  if (config.testPhone !== undefined) runtimeConfig.testPhone = formatPhoneNumber(config.testPhone);
  if (config.enabled !== undefined) runtimeConfig.enabled = !!config.enabled;

  return getWhatsAppConfig();
};

/**
 * Format clean slip number (e.g. #IND-4091)
 */
const formatSlipNumber = (id) => {
  if (!id) return `IND-${Math.floor(1000 + Math.random() * 9000)}`;
  const clean = id.replace(/[^a-zA-Z0-9]/g, '');
  const shortCode = clean.length > 5 ? clean.slice(-4).toUpperCase() : clean.toUpperCase();
  return `IND-${shortCode}`;
};

/**
 * Clean requester name without software role names like (SUPER ADMIN)
 */
const formatRequesterName = (name) => {
  if (!name) return 'Site Engineer';
  return name.replace(/\s*\([^)]*\)/g, '').trim() || 'Site In-Charge';
};

/**
 * Format Indian standard date and time
 */
const formatIndianDateTime = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Generate a formatted WhatsApp notification message text
 */
const generateMessageText = (data) => {
  const {
    id, project, material, qty, unit, reason, requester, createdAt
  } = data;
  
  const slipNo = formatSlipNumber(id);
  const engineerName = formatRequesterName(requester);
  const timeString = formatIndianDateTime(createdAt);

  return `📋 *SITE MATERIAL INDENT SLIP*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Project Site:* ${project || 'Site Project'}
🧱 *Material Item:* ${material}
📦 *Required Quantity:* ${qty} ${unit || 'Units'}
📍 *Work Area / Purpose:* ${reason || 'Site Construction'}
⏰ *Required Delivery:* Immediate / Site Stock
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 *Indent Slip No:* #${slipNo}
👷 *Raised By:* ${engineerName} (Site In-Charge)
📅 *Date & Time:* ${timeString}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Store Manager Notice:*
Please verify warehouse stock availability and arrange material dispatch to site.`;
};

/**
 * Generate a formatted status update message text
 */
const generateStatusUpdateText = (data) => {
  const { id, material, status, remarks } = data;
  const slipNo = formatSlipNumber(id);
  const timeString = formatIndianDateTime();

  const statusMap = {
    'APPROVED': 'APPROVED FOR DISPATCH ✅',
    'ISSUED': 'MATERIAL ISSUED TO SITE 🚚',
    'REJECTED': 'REJECTED ❌',
    'PENDING': 'PENDING REVIEW ⏳'
  };
  const statusLabel = statusMap[(status || '').toUpperCase()] || (status || '').toUpperCase();

  return `📦 *MATERIAL INDENT STATUS UPDATE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 *Indent Slip No:* #${slipNo}
🧱 *Material Item:* ${material}
📊 *Current Status:* *${statusLabel}*
📝 *Store Remarks:* ${remarks || 'Updated by store manager'}
📅 *Updated At:* ${timeString}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Material issuance processed from site inventory.`;
};

/**
 * Generate click-to-chat URL (Development & Direct Share mode)
 */
const generateClickToChatLink = (phone, text) => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return formattedPhone 
    ? `https://wa.me/${formattedPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
};

/**
 * Send WhatsApp message using Meta API (Production mode)
 */
const sendWhatsAppApiMessage = async (phone, text) => {
  const formattedPhone = formatPhoneNumber(phone);
  const token = runtimeConfig.apiToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = runtimeConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!token || !phoneId) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
  
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      status: 'sent'
    };
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Main service to send a notification (Baileys real message -> Meta API -> wa.me link fallback)
 */
const sendNotification = async (phone, data) => {
  const targetPhone = formatPhoneNumber(phone || runtimeConfig.testPhone || process.env.TEST_WHATSAPP_PHONE || '916382069963');
  const text = generateMessageText(data);
  const link = generateClickToChatLink(targetPhone, text);

  // 1. Try Baileys Real WhatsApp Dispatch
  const bridge = baileysService.getStatus();
  if (bridge.isConnected) {
    const directRes = await baileysService.sendDirectWhatsApp(targetPhone, text);
    if (directRes.success) {
      return {
        success: true,
        mode: 'real_whatsapp',
        messageId: directRes.messageId,
        status: 'sent',
        targetPhone,
        link,
        message: `Real WhatsApp message delivered to Store Manager (+${targetPhone})`
      };
    }
  }

  // 2. Try Meta Cloud API
  const token = runtimeConfig.apiToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = runtimeConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isConfigured = !!(token && phoneId);

  if (isConfigured && runtimeConfig.enabled) {
    const apiResult = await sendWhatsAppApiMessage(targetPhone, text);
    if (apiResult.success) {
      return { 
        success: true, 
        mode: 'api', 
        messageId: apiResult.messageId, 
        status: 'sent',
        targetPhone,
        link
      };
    } else {
      return {
        success: false,
        mode: 'api',
        error: apiResult.error,
        targetPhone,
        link
      };
    }
  }

  // 3. Fallback to click-to-chat link
  return {
    success: true,
    mode: 'link',
    link,
    targetPhone,
    status: 'pending_manual',
    message: 'Generated click-to-chat WhatsApp link'
  };
};

/**
 * Send status update notification
 */
const sendStatusUpdateNotification = async (phone, data) => {
  const targetPhone = formatPhoneNumber(phone || runtimeConfig.testPhone || process.env.TEST_WHATSAPP_PHONE || '916382069963');
  const text = generateStatusUpdateText(data);
  const link = generateClickToChatLink(targetPhone, text);

  // 1. Try Baileys Real WhatsApp Dispatch
  const bridge = baileysService.getStatus();
  if (bridge.isConnected) {
    const directRes = await baileysService.sendDirectWhatsApp(targetPhone, text);
    if (directRes.success) {
      return {
        success: true,
        mode: 'real_whatsapp',
        messageId: directRes.messageId,
        status: 'sent',
        targetPhone,
        link
      };
    }
  }

  // 2. Meta API
  const token = runtimeConfig.apiToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = runtimeConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isConfigured = !!(token && phoneId);

  if (isConfigured && runtimeConfig.enabled) {
    const apiResult = await sendWhatsAppApiMessage(targetPhone, text);
    return { ...apiResult, link, targetPhone };
  } else {
    return { success: true, mode: 'link', link, targetPhone, status: 'pending_manual' };
  }
};

/**
 * Send test notification to verify integration
 */
const sendTestNotification = async (phone) => {
  const targetPhone = formatPhoneNumber(phone || runtimeConfig.testPhone || process.env.TEST_WHATSAPP_PHONE || '916382069963');
  const text = `✅ *BUILDTRACK AI - REAL WHATSAPP CONNECTION VERIFIED*
━━━━━━━━━━━━━━━━━━━━━━
📡 *System:* KREO BuildTrack AI
🟢 *Status:* Real WhatsApp Dispatch Active
⏰ *Timestamp:* ${new Date().toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━━━
Real-time material requisitions will be automatically delivered to this number!`;

  const link = generateClickToChatLink(targetPhone, text);

  // 1. Try Baileys Real WhatsApp Dispatch
  const bridge = baileysService.getStatus();
  if (bridge.isConnected) {
    const directRes = await baileysService.sendDirectWhatsApp(targetPhone, text);
    if (directRes.success) {
      return {
        success: true,
        mode: 'real_whatsapp',
        messageId: directRes.messageId,
        status: 'sent',
        targetPhone,
        link,
        message: `Real WhatsApp message delivered to +${targetPhone}`
      };
    }
  }

  // 2. Meta API
  const token = runtimeConfig.apiToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = runtimeConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isConfigured = !!(token && phoneId);

  if (isConfigured && runtimeConfig.enabled) {
    const apiResult = await sendWhatsAppApiMessage(targetPhone, text);
    return { ...apiResult, link, targetPhone };
  } else {
    return {
      success: true,
      mode: 'link',
      link,
      targetPhone,
      message: 'Generated click-to-chat WhatsApp link (Connect WhatsApp QR to send directly)'
    };
  }
};

module.exports = {
  sendNotification,
  sendStatusUpdateNotification,
  sendTestNotification,
  generateClickToChatLink,
  getWhatsAppConfig,
  updateWhatsAppConfig,
  formatPhoneNumber
};

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

const SESSION_DIR = path.join(__dirname, '../../baileys_session');

let sock = null;
let qrCodeDataUrl = null;
let isConnected = false;
let connectedUser = null;
let connectionState = 'DISCONNECTED'; // 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTED'

// Ensure session directory exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

async function connectToWhatsApp() {
  try {
    if (sock) {
      try {
        sock.ev.removeAllListeners();
        sock.end();
      } catch (e) {}
      sock = null;
    }
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['BuildTrack AI', 'Desktop', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
          connectionState = 'SCAN_QR';
          console.log('[WhatsApp Bridge] 📱 New QR Code ready to scan in BuildTrack AI UI!');
        } catch (err) {
          console.error('[WhatsApp Bridge] Failed to generate QR data URL:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        isConnected = false;
        connectedUser = null;
        connectionState = 'DISCONNECTED';
        console.log(`[WhatsApp Bridge] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 3000);
        } else {
          try {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            fs.mkdirSync(SESSION_DIR, { recursive: true });
          } catch (e) {}
          setTimeout(connectToWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        qrCodeDataUrl = null;
        connectionState = 'CONNECTED';
        connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'Linked';
        console.log(`[WhatsApp Bridge] ✅ WhatsApp CONNECTED successfully! Linked Number: +${connectedUser}`);
      }
    });
  } catch (err) {
    console.error('[WhatsApp Bridge] Init error:', err);
  }
}

// Start connection on server boot
connectToWhatsApp();

function getStatus() {
  return {
    isConnected,
    connectionState,
    connectedUser,
    qrCode: qrCodeDataUrl
  };
}

async function sendDirectWhatsApp(targetPhone, messageText) {
  if (!targetPhone) {
    return { success: false, error: 'Target phone number is required' };
  }

  const cleanDigits = targetPhone.replace(/[^0-9]/g, '');
  const fullNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const jid = `${fullNumber}@s.whatsapp.net`;
  const fallbackLink = `https://wa.me/${fullNumber}?text=${encodeURIComponent(messageText)}`;

  if (!isConnected || !sock) {
    return {
      success: false,
      notConnected: true,
      message: 'WhatsApp not linked yet. Scan the QR code to connect.',
      link: fallbackLink,
      targetPhone: fullNumber
    };
  }

  try {
    const result = await sock.sendMessage(jid, { text: messageText });
    console.log(`[WhatsApp Bridge] 🚀 Real WhatsApp message delivered to +${fullNumber}!`);
    return {
      success: true,
      mode: 'real_whatsapp',
      messageId: result?.key?.id,
      targetPhone: fullNumber,
      message: `Real WhatsApp message delivered directly to Store Manager (+${fullNumber})`
    };
  } catch (err) {
    console.error(`[WhatsApp Bridge] Failed to send to +${fullNumber}:`, err);
    return {
      success: false,
      error: err.message,
      link: fallbackLink,
      targetPhone: fullNumber
    };
  }
}

async function restartSession() {
  try {
    if (sock) {
      try {
        sock.ev.removeAllListeners();
        sock.end();
      } catch (e) {}
      sock = null;
    }
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    fs.mkdirSync(SESSION_DIR, { recursive: true });
    isConnected = false;
    connectedUser = null;
    qrCodeDataUrl = null;
    connectionState = 'DISCONNECTED';
    await connectToWhatsApp();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  getStatus,
  sendDirectWhatsApp,
  restartSession
};

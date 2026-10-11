const whatsappService = require('../services/whatsappService');
const baileysService = require('../services/baileysService');

exports.getConfig = async (req, res, next) => {
  try {
    const config = whatsappService.getWhatsAppConfig();
    const bridge = baileysService.getStatus();
    res.status(200).json({ ...config, bridge });
  } catch (error) {
    next(error);
  }
};

exports.getBridgeStatus = async (req, res, next) => {
  try {
    const status = baileysService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

exports.restartBridge = async (req, res, next) => {
  try {
    const result = await baileysService.restartSession();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const { apiToken, phoneNumberId, testPhone, enabled } = req.body;
    const updated = whatsappService.updateWhatsAppConfig({
      apiToken,
      phoneNumberId,
      testPhone,
      enabled
    });
    res.status(200).json({ success: true, config: updated });
  } catch (error) {
    next(error);
  }
};

exports.sendTestMessage = async (req, res, next) => {
  try {
    const { phone, recipientPhone } = req.body;
    const target = phone || recipientPhone;
    const result = await whatsappService.sendTestNotification(target);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

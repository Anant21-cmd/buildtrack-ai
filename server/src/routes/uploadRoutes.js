const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original extension, add timestamp to prevent collisions
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Multi-file upload route
router.post('/', upload.array('media', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    // Map files to local accessible URLs (assuming server runs on localhost:5000)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const mediaUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

    res.status(200).json({
      message: 'Files uploaded successfully',
      mediaUrls
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ message: 'Internal server error during upload.' });
  }
});

module.exports = router;


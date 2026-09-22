const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BuildTrack AI REST API is running successfully',
    version: '1.0.0',
    phase: 'Phase 1: Project Setup',
    timestamp: new Date().toISOString()
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('BuildTrack AI Server is Active. Access API endpoints via /api');
});

// Authentication Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Company Routes
const companyRoutes = require('./routes/companyRoutes');
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);
app.use('/api/companies', companyRoutes);

// Project Routes
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

// Worker Routes
const workerRoutes = require('./routes/workerRoutes');
app.use('/api/workers', workerRoutes);

// Material Routes
const materialRoutes = require('./routes/materialRoutes');
app.use('/api/materials', materialRoutes);

// Vendor Routes
const vendorRoutes = require('./routes/vendorRoutes');
app.use('/api/vendors', vendorRoutes);

// Purchase Order Routes
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
app.use('/api/purchase-orders', purchaseOrderRoutes);

app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/material-requests', require('./routes/materialRequestRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/market-prices', require('./routes/marketPriceRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🏗️  BUILDTRACK AI API SERVER RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});


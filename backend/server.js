import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Restaurant POS Backend API',
    timestamp: new Date().toISOString(),
    appwrite_project: process.env.APPWRITE_PROJECT_ID || '6ac08445000e533e223f'
  });
});

// Petpooja / Aggregator Webhook Endpoint
app.post('/api/webhooks/petpooja', (req, res) => {
  console.log('📦 Incoming Petpooja Webhook Order:', req.body);
  res.status(200).json({ success: true, message: 'Order received and dispatched to KDS' });
});

app.listen(PORT, () => {
  console.log(`🚀 Hotel POS Backend Server running on http://localhost:${PORT}`);
});

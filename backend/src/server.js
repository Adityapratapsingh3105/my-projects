import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Controllers
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  getMembers,
  createMember
} from './controllers/groupController.js';

import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboardStats
} from './controllers/expenseController.js';

import {
  getGroupSettlements,
  recordSettlement,
  getSettlementHistory,
  resetDatabase
} from './controllers/settlementController.js';

import { scanBill, uploadMiddleware } from './controllers/aiController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SplitMate API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Group routes
app.get('/api/groups', getGroups);
app.get('/api/groups/:id', getGroupById);
app.post('/api/groups', createGroup);
app.put('/api/groups/:id', updateGroup);

// Member routes
app.get('/api/members', getMembers);
app.post('/api/members', createMember);

// Expense routes
app.get('/api/expenses', getExpenses);
app.get('/api/expenses/:id', getExpenseById);
app.post('/api/expenses', createExpense);
app.put('/api/expenses/:id', updateExpense);
app.delete('/api/expenses/:id', deleteExpense);

// Dashboard stats
app.get('/api/stats/dashboard', getDashboardStats);

// Smart Settlements & UPI
app.get('/api/settlements', getGroupSettlements);
app.post('/api/settlements/pay', recordSettlement);
app.get('/api/settlements/history', getSettlementHistory);
app.post('/api/settlements/reset', resetDatabase);

// AI Bill Scanner
app.post('/api/ai/scan-bill', uploadMiddleware, scanBill);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 SplitMate Backend Server running at: http://localhost:${PORT}
  -------------------------------------------------------------
  • API Health:       http://localhost:${PORT}/api/health
  • Groups API:       http://localhost:${PORT}/api/groups
  • Expenses API:     http://localhost:${PORT}/api/expenses
  • Settlements API:  http://localhost:${PORT}/api/settlements
  • Dashboard Stats:  http://localhost:${PORT}/api/stats/dashboard
  • AI Bill Scanner:  http://localhost:${PORT}/api/ai/scan-bill (POST)
  -------------------------------------------------------------
  `);
});

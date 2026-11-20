# 💸 SplitMate – Smart Hostel Expense Splitter

> A modern, startup-grade web application designed for hostel students, flatmates, and friends to effortlessly manage shared expenses, split bills with 4 flexible methods, and settle debts with the minimum number of UPI transactions.

---

## 🌟 Hackathon Highlights & Core Features

### 1. ⚡ Smart Debt Settlement (Minimum-Transactions Algorithm)
- Solves the classic hostel room problem: *“Amit owes Rahul ₹300, Rahul owes Vikram ₹200, Vikram owes Priya ₹500…”*
- Implements an optimal **Greedy Net-Balance Debt Simplification Algorithm**.
- Automatically reduces an $O(N^2)$ web of messy cross-transfers to at most $N-1$ clean settlements (typically **60% to 80% fewer transactions**).
- Displays clear **Before vs After** savings.

### 2. 📱 Instant UPI Payments & Dynamic QR Codes
- Every simplified settlement produces an NPCI-compliant UPI payment link:
  `upi://pay?pa=payee@upi&pn=PayeeName&am=Amount&cu=INR&tn=SplitMate`
- Generates a **high-resolution scannable QR code** directly in the modal for Google Pay, PhonePe, Paytm, and BHIM.
- One-click **"Mark as Paid"** with celebratory confetti and real-time balance recalculation.

### 3. ✨ AI Bill & Receipt Scanner (Gemini 3.8 Flash)
- Upload or capture any physical canteen bill, grocery slip, or restaurant invoice.
- Uses **Gemini 3.8 Flash** with structured JSON output to extract:
  - Merchant / Store Name
  - Date
  - Itemized dishes & quantities
  - Subtotal, taxes, and grand total
- **Human-in-the-loop review**: Users can review and edit every single extracted line item and price before saving.
- Includes a **Smart Mock Scanner** that works out of the box even before adding an API key.

### 4. 🍕 4 Advanced Split Modes
- **Equal Split**: Even division across all selected roommates with automatic cent-balancing.
- **Unequal Split**: Exact custom rupee amounts with live sum-validation.
- **Percentage Split**: Custom % per member with live 100% total verification.
- **Item-wise Split**: Assign individual dishes/items directly to the specific friends who consumed them.

### 5. 👥 Multi-User Perspective Switcher
- Switch between **Rahul**, **Priya**, **Amit**, **Sneha**, and **Vikram** from the top bar to inspect:
  - *"What I Owe"*
  - *"Who Owes Me"*
  - Net creditor vs debtor standing

### 6. 📊 Real-Time Analytics & Mess CSV Export
- Category spending distribution (Food, Groceries, Rent, Utilities, Travel).
- Top spender recognition and average expense metrics.
- One-click **Export to CSV** for hostel warden and mess registers.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express, Multer, QRCode |
| **AI Vision OCR** | Google Gemini 3.8 Flash (`@google/genai`) |
| **Database** | Persistent JSON Database with ACID file safety & instant seed data |

---

## 🚀 Quick Start (Running SplitMate)

### 1. Start Both Backend & Frontend with One Command
Open PowerShell or Command Prompt in the project folder and run:
```bash
npm run dev
```

### 2. Or Run Separately in Two Terminals:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm start
```
*Backend runs at:* `http://localhost:5000`

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 🔑 (Optional) Setting Your Gemini API Key

SplitMate works completely offline with a smart simulator right out of the box. To activate live Gemini 3.8 Flash AI scanning:

1. Get a free API key at [Google AI Studio](https://aistudio.google.com/).
2. Open `backend/.env` in any text editor.
3. Paste your key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
4. Restart the backend server. That's it!

---

## 📁 Project Structure

```
my projects/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Persistent JSON store with atomic file writes
│   │   ├── controllers/
│   │   │   ├── groupController.js    # Groups & hostel members
│   │   │   ├── expenseController.js  # Expense CRUD & split validations
│   │   │   ├── settlementController.js # Smart debt settlement & history
│   │   │   └── aiController.js       # Bill upload & OCR controller
│   │   ├── services/
│   │   │   ├── debtSimplifier.js     # Greedy Min-Transactions algorithm
│   │   │   ├── upiService.js         # UPI URI scheme & QR code generation
│   │   │   └── geminiService.js      # Gemini 3.8 Flash multimodal scanner
│   │   ├── data/
│   │   │   └── seedData.js           # Sample hostel rooms, trips & bills
│   │   └── server.js                 # Express server & API routes
│   ├── .env                          # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, BottomNav, StatCard, Modals
│   │   ├── pages/                    # Dashboard, Groups, GroupDetail, Settlements, Expenses, Analytics
│   │   ├── context/AppContext.jsx    # Global state management
│   │   ├── services/api.js           # REST API client
│   │   └── index.css                 # Dark navy/emerald theme
│   ├── vite.config.js                # Vite config with API proxy
│   └── package.json
└── package.json                      # Root orchestrator
```

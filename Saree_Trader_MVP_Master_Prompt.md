

---

# Master System Prompt: Project name: SAI

**Target AI / Developer Agent Instructions:** You are a Senior Full-Stack Engineer + UI/UX Architect. Build a **production-ready MVP** for a saree wholesale trading business with **zero learning curve**, **maximum 2 clicks to any destination**, and a **sleek, fast, mobile-first UI**. Every screen must show actionable data first. Prioritize cash flow visibility, automated recovery, and fraud-proof accounting.

---
```markdown
# Saree Trader MVP – Complete Application Specification

**Version:** 1.0  
**Target:** Production‑ready demo for uncle (Surat saree trader)  
**UI Style:** Anti‑gravity (glassmorphism, floating cards, smooth animations)  
**Color Theme:** Business professional – Navy / Teal + Off‑white  
**Responsive:** Mobile‑first, works on phone, tablet, desktop  

---

## 1. Tech Stack (Minimal, No Hallucination)

| Layer       | Choice                                      |
|-------------|---------------------------------------------|
| Frontend    | React + Tailwind CSS + React Router (optional, can be single‑page tabs) |
| Backend     | Node.js + Express (single `index.js` file)  |
| Database    | SQLite (file‑based, `database.sqlite`)      |
| Messaging   | Telegram Bot API                            |
| AI Prompt   | Grok API (xAI) – no image generation inside |
| Auth        | None (single user, optional hardcoded password query param) |

---

## 2. Database Schema (SQLite)

Run this `schema.sql` once.

```sql
-- Clients
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Invoices
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  issue_date TEXT NOT NULL,   -- YYYY-MM-DD
  due_date TEXT NOT NULL,
  FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE RESTRICT
);

-- Payments
CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date TEXT NOT NULL,
  FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
);

-- Inventory
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  fabric TEXT,
  color TEXT,
  print TEXT,
  texture TEXT,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**No `status` column** – compute in backend.

---

## 3. Backend API Endpoints (Express)

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body (JSON) |
|--------|----------|-------------|----------------------|
| GET | `/clients` | List all clients | – |
| POST | `/clients` | Add client | `{ name, phone }` |
| GET | `/clients/:id/invoices` | Client ledger (invoices + payments) | – |
| POST | `/invoices` | Create invoice | `{ client_id, amount, issue_date, due_date }` |
| POST | `/payments` | Record payment (updates invoice paid_amount) | `{ invoice_id, amount, payment_date }` |
| GET | `/inventory` | List all inventory | – |
| POST | `/inventory` | Add inventory item | `{ sku, fabric, color, print, texture, stock_quantity, reorder_level }` |
| PUT | `/inventory/:id/stock` | Adjust stock (positive = add, negative = remove) | `{ change }` |
| POST | `/telegram/remind` | Send 60‑day reminders to all overdue invoices | – (optional `days` query param: 30/60/90) |
| POST | `/ai/generate-prompt` | Call Grok API, return prompt text | `{ pose, color, print, texture }` |

**Telegram logic:**  
- Find invoices where `paid_amount < amount` and `(julianday('now') - julianday(issue_date)) IN (30,60,90)`.  
- For each, send:  
  `Hello {client_name}, reminder for Invoice #{id} of ₹{amount}. {days} days overdue. Outstanding: ₹{amount - paid_amount}. Please pay.`

**Grok API call:**  
- System prompt: *"Generate a detailed, professional prompt for an AI video/photoshoot model wearing a saree. Use: pose={pose}, color={color}, print={print}, texture={texture}. Output only the prompt text, no explanation."*  
- Return the response as `{ prompt: "..." }`.

---

## 4. Frontend – React + Tailwind (Responsive, Anti‑gravity UI)

### 4.1 Global Styles & Theme

- **Background:** Gradient `from-gray-50 to-gray-100`  
- **Cards:** `bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20`  
- **Primary Button:** `bg-navy-600 hover:bg-navy-700 text-white px-5 py-2 rounded-full transition transform hover:scale-105`  
- **Danger Button:** `bg-rose-500 hover:bg-rose-600`  
- **Warning Badge:** `bg-amber-100 text-amber-800 px-3 py-1 rounded-full`  
- **Inputs:** `bg-white/50 rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-navy-500`

Define custom colors in `tailwind.config.js`:
```js
colors: {
  navy: { 600: '#1E3A8A', 700: '#172554' },
  teal: { 500: '#0D9488' }
}
```

### 4.2 Layout – One Page with Three Tabs (or expandable sections)

- **Tab 1: Ledger** – Clients list, add client, view ledger (invoices + payments), add invoice, record payment.  
- **Tab 2: Inventory** – List inventory items, add new item, adjust stock (+ / -), low stock indicator.  
- **Tab 3: AI Prompt** – Form (pose, color, print, texture), Generate button, output box with copy button.

**Dashboard Header** (visible on all tabs):  
- Total outstanding amount (sum of all unpaid invoice balances)  
- Low stock count (inventory items where `stock_quantity <= reorder_level`)  
- **Big button:** “Send 60‑day reminders now” (calls `/telegram/remind`)

### 4.3 2‑Click Rule – Verified Flows

| Action | Clicks |
|--------|--------|
| View client ledger | 1 (client name in list) |
| Add invoice | 2 (client → “Add Invoice” button) |
| Record payment | 2 (invoice → “Pay” button) |
| Adjust stock | 2 (inventory item → + / - button) |
| Generate AI prompt | 2 (fill form → Generate) |
| Send reminders | 1 (dashboard button) |

### 4.4 Responsive Breakpoints

- **Mobile (<640px):** Tabs become a bottom navigation bar, cards full width, font size slightly smaller.  
- **Tablet (640px‑1024px):** Two‑column layout for lists.  
- **Desktop (>1024px):** Three‑column grid for inventory, side‑by‑side client list and ledger.

Use Tailwind responsive classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

---

## 5. File Structure (Flat, Easy to Build)

```
saree-trader-mvp/
├── backend/
│   ├── index.js          (all API routes, SQLite setup, Telegram, Grok)
│   ├── database.sqlite   (auto‑created)
│   ├── schema.sql        (initial tables)
│   └── .env              (BOT_TOKEN, GROK_API_KEY)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── LedgerTab.jsx
│   │   ├── InventoryTab.jsx
│   │   ├── AIPromptTab.jsx
│   │   ├── DashboardHeader.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 6. Environment Variables (.env)

```
PORT=5000
TELEGRAM_BOT_TOKEN=your_bot_token_here
GROK_API_KEY=your_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1/chat/completions   (example – use actual Grok endpoint)
```

---

## 7. Build & Run Instructions

1. Clone repo, install dependencies:  
   `cd backend && npm install express sqlite3 cors dotenv node-fetch`  
   `cd frontend && npm install react react-dom axios tailwindcss`

2. Set up database:  
   `sqlite3 backend/database.sqlite < backend/schema.sql`

3. Start backend: `node backend/index.js` (runs on port 5000)

4. Start frontend: `npm run dev` (runs on port 5173)

5. Open browser to `http://localhost:5173`

---

## 8. Demo Walkthrough (5 minutes)

1. **Add a client** → Ledger tab → + New Client → “Kiran Sarees”, phone `+91XXXXXXXXXX`.  
2. **Create invoice** → click client → Add Invoice → ₹50,000, due yesterday.  
3. **Record partial payment** → invoice → Pay → ₹20,000 → ledger shows remaining ₹30,000.  
4. **Add inventory** → Inventory tab → Add Item → SKU `S001`, fabric `Silk`, color `Red`, stock 10, reorder 5.  
5. **Adjust stock** → click + button → stock becomes 11.  
6. **Send Telegram reminder** → Dashboard button → check your phone (use uncle’s number as client phone).  
7. **Generate AI prompt** → AI Prompt tab → Pose: “walking on ramp”, Color: “maroon”, Print: “paisley”, Texture: “silk zari” → Generate → copy prompt → paste into Flow AI.

**All features work end‑to‑end. No hallucinations.**

---

## 9. Success Criteria (Checklist for Uncle)

- [ ] Ledger shows correct outstanding balance after payment.  
- [ ] Inventory shows low stock warning when stock ≤ reorder level.  
- [ ] Telegram message arrives within 5 seconds of clicking “Send reminders”.  
- [ ] Grok returns a usable prompt (not empty, not error).  
- [ ] Entire UI is responsive on mobile (no horizontal scroll, tap targets large enough).  
- [ ] No page requires more than 2 clicks to reach any feature.

---

**Ready to code. Build exactly this and your uncle will say: “Bechna chalu kar.”**
```
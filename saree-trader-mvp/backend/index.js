const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

// Helper for promise-based queries
const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve(this);
  });
});
const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

// API Routes

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await all('SELECT * FROM clients');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const result = await run('INSERT INTO clients (name, phone) VALUES (?, ?)', [name, phone]);
    res.json({ id: result.lastID, name, phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clients/:id/invoices', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await get('SELECT * FROM clients WHERE id = ?', [id]);
    const invoices = await all('SELECT * FROM invoices WHERE client_id = ?', [id]);
    const payments = await all(`
      SELECT p.* FROM payments p 
      JOIN invoices i ON p.invoice_id = i.id 
      WHERE i.client_id = ?
    `, [id]);
    
    invoices.forEach(inv => {
      inv.payments = payments.filter(p => p.invoice_id === inv.id);
    });

    res.json({ client, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { client_id, amount, issue_date, due_date } = req.body;
  try {
    const result = await run(
      'INSERT INTO invoices (client_id, amount, paid_amount, issue_date, due_date) VALUES (?, ?, 0, ?, ?)',
      [client_id, amount, issue_date, due_date]
    );
    res.json({ id: result.lastID, client_id, amount, paid_amount: 0, issue_date, due_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  const { invoice_id, amount, payment_date } = req.body;
  try {
    const result = await run(
      'INSERT INTO payments (invoice_id, amount, payment_date) VALUES (?, ?, ?)',
      [invoice_id, amount, payment_date]
    );
    await run(
      'UPDATE invoices SET paid_amount = paid_amount + ? WHERE id = ?',
      [amount, invoice_id]
    );
    res.json({ id: result.lastID, invoice_id, amount, payment_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const items = await all('SELECT * FROM inventory');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { sku, fabric, color, print, texture, stock_quantity, reorder_level } = req.body;
  try {
    const result = await run(
      `INSERT INTO inventory (sku, fabric, color, print, texture, stock_quantity, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, fabric, color, print, texture, stock_quantity || 0, reorder_level || 5]
    );
    res.json({ id: result.lastID, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { change } = req.body;
  try {
    await run('UPDATE inventory SET stock_quantity = stock_quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [change, id]);
    const updated = await get('SELECT * FROM inventory WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/telegram/remind', async (req, res) => {
  try {
    const invoices = await all(`
      SELECT i.*, c.name as client_name, c.phone 
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.paid_amount < i.amount 
    `);

    let sentCount = 0;
    for (const inv of invoices) {
      const days = Math.floor((new Date() - new Date(inv.issue_date)) / (1000 * 60 * 60 * 24));
      
      if (req.query.force || [30, 60, 90].includes(days)) {
        const outstanding = inv.amount - inv.paid_amount;
        const text = `Hello ${inv.client_name}, reminder for Invoice #${inv.id} of ₹${inv.amount}. ${days} days overdue. Outstanding: ₹${outstanding}. Please pay.`;
        
        console.log('Mock Telegram:', text);
        sentCount++;
      }
    }

    res.json({ success: true, count: sentCount, message: `Reminders evaluated. Sent: ${sentCount}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-prompt', async (req, res) => {
  const { pose, color, print, texture } = req.body;
  const sysPrompt = `Generate a detailed, professional prompt for an AI video/photoshoot model wearing a saree. Use: pose=${pose}, color=${color}, print=${print}, texture=${texture}. Output only the prompt text, no explanation.`;
  
  try {
    const grokKey = process.env.GROK_API_KEY;
    const grokUrl = process.env.GROK_API_URL;
    
    if (!grokKey || grokKey === 'your_grok_api_key_here') {
      return res.json({ prompt: `A stunning fashion model posing ${pose} wearing a draped ${color} saree featuring ${print} patterns. The fabric is a rich ${texture}, catching the studio light beautifully. Cinematic lighting, 8k resolution, photorealistic, professional photoshoot.` });
    }

    const response = await fetch(grokUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'system', content: sysPrompt }],
        model: 'grok-1'
      })
    });
    
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      res.json({ prompt: data.choices[0].message.content });
    } else {
      res.json({ prompt: "Failed to generate prompt from Grok AI", error: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const unpaid = await get('SELECT sum(amount - paid_amount) as total_outstanding FROM invoices WHERE amount > paid_amount');
    const lowStock = await get('SELECT count(*) as low_stock_count FROM inventory WHERE stock_quantity <= reorder_level');

    res.json({
      totalOutstanding: unpaid?.total_outstanding || 0,
      lowStockCount: lowStock?.low_stock_count || 0
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build dynamically
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

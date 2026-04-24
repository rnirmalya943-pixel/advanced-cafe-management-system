import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database setup
  const dbPath = path.join(process.cwd(), 'cafe.db');
  const db = new Database(dbPath);

  // Initialize DB tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      price REAL,
      category TEXT DEFAULT 'Uncategorized'
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT,
      item TEXT,
      qty INTEGER,
      total REAL,
      date TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_name TEXT,
      qty INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );
  `);

  // Add columns to existing table if missing migration
  try {
    db.exec(`ALTER TABLE menu ADD COLUMN category TEXT DEFAULT 'Uncategorized'`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'`);
  } catch (e) {}
  try {
    // SQLite doesn't support non-constant DEFAULT in ALTER TABLE ADD COLUMN
    db.exec(`ALTER TABLE orders ADD COLUMN created_at TEXT`);
    // Backfill existing rows
    db.exec(`UPDATE orders SET created_at = date || ' 12:00:00' WHERE created_at IS NULL`);
  } catch (e) {}
  
  try {
    const checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'").get();
    if (!checkTable) {
        db.exec(`
          CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            item_name TEXT,
            qty INTEGER,
            price REAL,
            FOREIGN KEY(order_id) REFERENCES orders(id)
          );
        `);
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM order_items').get() as {count: number};
    if (count.count === 0) {
      db.exec(`
        INSERT INTO order_items (order_id, item_name, qty, price)
        SELECT id, item, qty, total/qty FROM orders WHERE item IS NOT NULL AND qty > 0
      `);
    }
  } catch (e) {}

  // Create default admin if not exists
  const checkAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!checkAdmin) {
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', 'admin123', 'admin');
  }

  // --- API Routes ---

  // Staff Login (No Password)
  app.post('/api/staff-login', (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Please enter your name' });
    }
    // Create a temporary session object for staff
    res.json({ success: true, user: { id: Date.now(), username, role: 'staff' } });
  });

  // Login
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Get Menu
  app.get('/api/menu', (req, res) => {
    const items = db.prepare('SELECT * FROM menu').all();
    res.json(items);
  });

  // Add Item
  app.post('/api/menu', (req, res) => {
    const { name, price, category } = req.body;
    try {
      db.prepare('INSERT INTO menu (name, price, category) VALUES (?, ?, ?)').run(name, price, category || 'Uncategorized');
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Delete Item
  app.delete('/api/menu/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM menu WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Place Order
  app.post('/api/orders', (req, res) => {
    const { customer, items, total, date } = req.body;
    try {
      const created_at = new Date().toISOString();
      const itemTitle = items.length === 1 ? items[0].name : `${items.length} Items`;
      const totalQty = items.reduce((sum: number, i: any) => sum + i.qty, 0);

      const result = db.prepare('INSERT INTO orders (customer, item, qty, total, date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(customer, itemTitle, totalQty, total, date, 'pending', created_at);
      const orderId = result.lastInsertRowid;

      const insertItem = db.prepare('INSERT INTO order_items (order_id, item_name, qty, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        insertItem.run(orderId, item.name, item.qty, item.price);
      }

      res.json({ success: true, orderId });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Get Single Order
  app.get('/api/orders/:id', (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    if (order) {
      order.items = db.prepare('SELECT item_name as name, qty, price FROM order_items WHERE order_id = ?').all(req.params.id);
      res.json(order);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  });

  // Update Order Status
  app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // Get Orders (Real-time history simulator)
  app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 50').all() as any[];
    const allItems = db.prepare('SELECT * FROM order_items').all() as any[];
    
    orders.forEach(order => {
      order.items = allItems
        .filter(i => i.order_id === order.id)
        .map(i => ({ name: i.item_name, qty: i.qty, price: i.price }));
    });
    
    res.json(orders);
  });

  // Daily Sales Report
  app.get('/api/report', (req, res) => {
    const { date } = req.query; // date in YYYY-MM-DD
    const report = db.prepare('SELECT SUM(total) as totalSales, COUNT(id) as totalOrders FROM orders WHERE date = ?').get(date) as any;
    
    const topItems = db.prepare('SELECT item_name as name, SUM(order_items.qty) as value FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE orders.date = ? GROUP BY item_name ORDER BY value DESC LIMIT 5').all(date);
    
    const peakHours = db.prepare(`
       SELECT strftime('%H', datetime(created_at, 'localtime')) as hour, COUNT(id) as orders 
       FROM orders 
       WHERE date = ? 
       GROUP BY hour 
       ORDER BY hour ASC
    `).all(date) as any[];

    const peakHoursData = peakHours.map(p => ({
        time: `${p.hour}:00`,
        orders: p.orders
    }));

    res.json({
        totalSales: report.totalSales || 0,
        totalOrders: report.totalOrders || 0,
        topItems: topItems || [],
        peakHours: peakHoursData || []
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const fs = await import('fs');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Note: since this is built using tsc to a cjs file, __dirname might fail or behave differently.
    // It is best to use process.cwd()
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

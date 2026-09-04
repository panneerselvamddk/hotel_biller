import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool Configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "pan123",
  database: process.env.DB_NAME || "biller",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initDatabase() {
  try {
    // First connect without database selected to create database if it doesn't exist
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConn.end();

    // Initialize Connection Pool
    pool = mysql.createPool(dbConfig);
    console.log(` Connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);

    // Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        type ENUM('veg', 'nonveg') NOT NULL DEFAULT 'veg',
        cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        date DATETIME NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        payment VARCHAR(50) NOT NULL DEFAULT 'UPI',
        status VARCHAR(50) NOT NULL DEFAULT 'Paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        qty INT NOT NULL DEFAULT 1,
        line_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if menu_items is empty, if so populate default menu
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM menu_items");
    if (rows[0].count === 0) {
      const defaultMenu = [
        ["vd-dosa", "Dosa", "Veg Dosas", 30.0, "veg"],
        ["vd-roast", "Roast", "Veg Dosas", 40.0, "veg"],
        ["vd-rava", "Rava Dosa", "Veg Dosas", 50.0, "veg"],
        ["vd-onion", "Onion Dosa", "Veg Dosas", 50.0, "veg"],
        ["vd-oothappam", "Onion Oothappam", "Veg Dosas", 60.0, "veg"],
        ["vd-ghee", "Ghee Roast", "Veg Dosas", 60.0, "veg"],
        ["vd-podi", "Podi Dosa", "Veg Dosas", 60.0, "veg"],
        ["vd-guntur", "Guntur Kaara Dosa", "Veg Dosas", 60.0, "veg"],
        ["vd-ghee-rava", "Ghee Rava Dosa", "Veg Dosas", 70.0, "veg"],
        ["vd-ghee-podi", "Ghee Podi Dosa", "Veg Dosas", 70.0, "veg"],
        ["vd-poond", "Poond(u) Podi Dosa", "Veg Dosas", 70.0, "veg"],
        ["vd-murungai", "Murungai Podi Dosa", "Veg Dosas", 70.0, "veg"],
        ["vd-curry", "Curry Leaves Podi Dosa", "Veg Dosas", 70.0, "veg"],
        ["vd-butter", "Butter Dosa", "Veg Dosas", 80.0, "veg"],
        ["vd-poond-dosa", "Poond(u) Dosa", "Veg Dosas", 80.0, "veg"],
        ["vd-mushroom", "Mushroom Dosa", "Veg Dosas", 80.0, "veg"],
        ["nv-chicken", "Chicken Kari Dosa", "Non-Veg Dosas", 100.0, "nonveg"],
        ["nv-prawn", "Prawn Dosa", "Non-Veg Dosas", 120.0, "nonveg"],
        ["nv-prawn-half", "Prawn Half Boil Dosa", "Non-Veg Dosas", 130.0, "nonveg"],
        ["nv-half", "Half Boil Dosa", "Non-Veg Dosas", 50.0, "nonveg"],
        ["nv-egg", "Egg Dosa", "Non-Veg Dosas", 50.0, "nonveg"],
        ["nv-kaara", "Kaara Egg Dosa", "Non-Veg Dosas", 60.0, "nonveg"],
        ["vi-idly", "Idly", "Veg Idly", 10.0, "veg"],
        ["vi-poond", "Poond(u) Podi Idly", "Veg Idly", 20.0, "veg"],
        ["vi-curry", "Curry Leaves Podi Idly", "Veg Idly", 20.0, "veg"],
        ["vi-mini", "Mini Idly Bowl (16 pcs)", "Veg Idly", 50.0, "veg"],
        ["nvi-chicken", "Chicken Kari Idly", "Non-Veg Idly", 25.0, "nonveg"],
        ["nvi-egg", "Egg Kothu Idly", "Non-Veg Idly", 50.0, "nonveg"],
        ["nvi-kothu", "Chicken Kothu Idly", "Non-Veg Idly", 60.0, "nonveg"],
        ["ch-normal", "Normal Chapathi", "Chapathi", 15.0, "veg"],
        ["ch-egg", "Egg Chapathi", "Chapathi", 25.0, "nonveg"],
        ["ch-kothu", "Kothu Chapathi", "Chapathi", 40.0, "veg"],
        ["ch-chicken", "Chicken Kothu Chapathi", "Chapathi", 50.0, "nonveg"],
      ];
      await pool.query(
        "INSERT INTO menu_items (id, name, category, price, type) VALUES ?",
        [defaultMenu]
      );
      console.log(" Seeded initial menu items into MySQL database.");
    }
  } catch (err) {
    console.error(" Error initializing MySQL database connection:", err.message);
  }
}

// REST API ENDPOINTS

// Health Check Endpoint
app.get("/api/health", async (req, res) => {
  try {
    if (!pool) throw new Error("Database pool not initialized");
    await pool.query("SELECT 1");
    res.json({ status: "OK", database: "Connected", db_name: dbConfig.database });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

// GET Menu Items
app.get("/api/menu", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu_items ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Menu Item Price
app.put("/api/menu/:id/price", async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    const numericPrice = Math.max(0, Number(price) || 0);

    await pool.query("UPDATE menu_items SET price = ? WHERE id = ?", [
      numericPrice,
      id,
    ]);
    res.json({ success: true, id, price: numericPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Orders with Line Items
app.get("/api/orders", async (req, res) => {
  try {
    const [orderRows] = await pool.query(
      "SELECT * FROM orders ORDER BY date DESC"
    );
    if (!orderRows.length) return res.json([]);

    const [itemRows] = await pool.query("SELECT * FROM order_items");

    const ordersMap = orderRows.map((o) => {
      const items = itemRows
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          id: i.item_id,
          name: i.name,
          category: i.category,
          price: Number(i.price),
          qty: i.qty,
        }));
      return {
        id: o.id,
        date: o.date,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        total: Number(o.total),
        payment: o.payment,
        status: o.status,
        items,
      };
    });

    res.json(ordersMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE New Order
app.post("/api/orders", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id, date, items, subtotal, discount, total, payment, status } =
      req.body;

    await connection.beginTransaction();

    // Insert Order Header
    const formattedDate = new Date(date || Date.now())
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.query(
      "INSERT INTO orders (id, date, subtotal, discount, total, payment, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        formattedDate,
        subtotal || total,
        discount || 0,
        total,
        payment || "UPI",
        status || "Paid",
      ]
    );

    // Insert Order Line Items
    if (Array.isArray(items) && items.length > 0) {
      const itemValues = items.map((i) => [
        id,
        i.id,
        i.name,
        i.category || "General",
        i.price,
        i.qty,
        i.price * i.qty,
      ]);
      await connection.query(
        "INSERT INTO order_items (order_id, item_id, name, category, price, qty, line_total) VALUES ?",
        [itemValues]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, orderId: id });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Taste of Thanjai POS Backend API running on http://localhost:${PORT}`);
  });
});

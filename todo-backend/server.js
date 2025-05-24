const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware

const allowedOrigins = ["https://to-do-list-cyan-rho.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());

// PostgreSQL Pool Setup
require('dotenv').config(); // make sure this is at the top



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


// ✅ Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the To-Do API backend!');
});


// ✅ Login Route
const bcrypt = require('bcrypt');

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Get user by username
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, userId: user.id });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ Get Tasks by User ID
app.get('/api/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ Add a Task
app.post('/api/tasks', async (req, res) => {
  const { userId, title, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3)',
      [userId, title, description]
    );
    res.json({ success: true, message: 'Task added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ Delete a Task
app.delete('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [taskId]
    );
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const bcrypt = require("bcrypt"); // Ensure this is imported at the top

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  console.log("📥 Incoming registration request:", req.body);

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log("⚠️ Username already exists");
      return res.status(409).json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    console.log("✅ User registered with ID:", result.rows[0].id);

    res.status(201).json({ success: true, userId: result.rows[0].id });

  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

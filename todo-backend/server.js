const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Pool Setup
const pool = new Pool({
  user: 'postgres',             // Your PostgreSQL username
  host: 'localhost',
  database: 'todo_app',         // Your database name
  password: 'anjali18',    // Your pgAdmin password
  port: 5432,
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the To-Do API backend!');
});


// ✅ Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, userId: result.rows[0].id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
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

// ✅ Register Route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, password]
    );

    res.status(201).json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Register Route
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, password]
    );

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

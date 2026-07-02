const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'appuser',
  password: process.env.POSTGRES_PASSWORD || 'appsecret',
  database: process.env.POSTGRES_DB || 'appdb',
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Database initialized and users table is ready.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id, email',
      [email, passwordHash]
    );

    return res.status(201).json({ message: 'Account created', user: insert.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const port = process.env.PORT || 4000;
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
});



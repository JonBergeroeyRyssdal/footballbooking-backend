// controllers/auth.controller.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerOwner = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Alle felt er påkrevd' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'E-posten er allerede i bruk' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'owner']
    );

    const userId = userResult.insertId;

    await pool.query(
      'INSERT INTO owners (user_id, phone) VALUES (?, ?)',
      [userId, phone]
    );

    res.status(201).json({ message: 'Eier registrert', userId });
  } catch (error) {
    console.error('Feil ved registrering:', error);
    res.status(500).json({ error: 'Noe gikk galt ved registrering' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Ugyldig e-post eller passord' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Ugyldig e-post eller passord' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Send med user-objektet (uten passord)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({ message: 'Innlogging vellykket', token, user: userData });
  } catch (err) {
    console.error('Innloggingsfeil:', err);
    res.status(500).json({ error: 'Noe gikk galt under innlogging' });
  }
};




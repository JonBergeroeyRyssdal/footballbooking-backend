// routes/initAdmin.route.js
import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../config/db.js'

const router = express.Router()

router.get('/init-superadmin', async (req, res) => {
  const name = 'Superadmin'
  const email = 'admin@example.com'
  const rawPassword = 'admin123' // ← Endre dette etter første bruk
  const hashedPassword = await bcrypt.hash(rawPassword, 10)

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Admin-bruker finnes allerede' })
    }

    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    )

    res.json({ message: '✅ Superadmin opprettet', email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Feil ved opprettelse av admin' })
  }
})

export default router

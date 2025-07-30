import pool from '../config/db.js'
import bcrypt from 'bcrypt'

export const registerOwner = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'E-post er allerede registrert.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'owner']
    )

    const userId = result.insertId

    await pool.query(
      'INSERT INTO owners (user_id) VALUES (?)',
      [userId]
    )

    res.status(201).json({ message: 'Baneier registrert!', userId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Serverfeil.' })
  }
}

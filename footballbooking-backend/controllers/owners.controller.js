import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hemmelignøkkel'

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

export const loginOwner = async (req, res) => {
  const { email, password } = req.body

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(401).json({ message: 'Ugyldig e-post eller passord.' })
    }

    const user = users[0]

    if (user.role !== 'owner') {
      return res.status(403).json({ message: 'Du er ikke registrert som baneier.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Ugyldig e-post eller passord.' })
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' })

    res.json({
      message: 'Innlogging vellykket!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Serverfeil ved innlogging.' })
  }
}

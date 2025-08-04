import pool from '../config/db.js'

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, phone, role
      FROM users
      WHERE role = 'user'
    `)

    res.status(200).json(users)
  } catch (err) {
    console.error('Feil ved henting av brukere:', err)
    res.status(500).json({ message: 'Kunne ikke hente brukere' })
  }
}

export const getAllOwners = async (req, res) => {
  try {
    const [owners] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone
      FROM users u
      JOIN owners o ON u.id = o.user_id
    `)

    res.status(200).json(owners)
  } catch (err) {
    console.error('Feil ved henting av eiere:', err)
    res.status(500).json({ message: 'Kunne ikke hente eiere' })
  }
}

export const getUserCounts = async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(`SELECT COUNT(*) AS userCount FROM users WHERE role = 'user'`)
    const [[{ ownerCount }]] = await pool.query(`SELECT COUNT(*) AS ownerCount FROM users WHERE role = 'owner'`)
    res.json({ userCount, ownerCount })
  } catch (err) {
    console.error('Feil ved telling av brukere og eiere:', err)
    res.status(500).json({ message: 'Kunne ikke hente telling' })
  }
}


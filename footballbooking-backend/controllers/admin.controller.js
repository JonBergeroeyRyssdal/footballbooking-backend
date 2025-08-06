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
      SELECT o.id AS owner_id, u.name, u.email, u.phone
      FROM owners o
      JOIN users u ON u.id = o.user_id
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

// GET /api/admin/owners/:ownerId/pitches
export const getPitchesByOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const [pitches] = await pool.query(
      `SELECT id, name, size, location FROM pitches WHERE owner_id = ?`,
      [ownerId]
    );
    res.json(pitches);
  } catch (err) {
    console.error('Feil ved henting av baner:', err);
    res.status(500).json({ message: 'Kunne ikke hente baner for eier' });
  }
};


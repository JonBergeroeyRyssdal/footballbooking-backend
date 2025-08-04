import pool from '../config/db.js'

export const createPitchService = async ({ userId, name, size, location }) => {
  // Finn owner_id fra users.id
  const [rows] = await pool.query(`SELECT id FROM owners WHERE user_id = ?`, [userId])

  if (rows.length === 0) {
    throw new Error('Ingen owner-konto funnet for denne brukeren.')
  }

  const ownerId = rows[0].id

  const [result] = await pool.query(
    `INSERT INTO pitches (owner_id, name, size, location)
     VALUES (?, ?, ?, ?)`,
    [ownerId, name, size, location]
  )

  return {
    id: result.insertId,
    ownerId,
    name,
    size,
    location,
  }
}

export const getPitchesByUserId = async (userId) => {
  // Hent owner_id basert på user_id
  const [ownerRows] = await pool.query(
    `SELECT id FROM owners WHERE user_id = ?`,
    [userId]
  )

  if (ownerRows.length === 0) return []

  const ownerId = ownerRows[0].id

  const [pitches] = await pool.query(
    `SELECT id, name, size, location FROM pitches WHERE owner_id = ?`,
    [ownerId]
  )

  return pitches
}

export const getAllPitchesService = async () => {
  const [pitches] = await pool.query(
    `SELECT
      p.id,
      p.name,
      p.size,
      p.location,
      o.id as ownerId,
      u.name as ownerName
    FROM pitches p
    JOIN owners o ON p.owner_id = o.id
    JOIN users u ON o.user_id = u.id`
  )

  return pitches
}


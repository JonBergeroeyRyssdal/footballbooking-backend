// /services/availability.service.js
import pool from '../config/db.js'

export const ensurePitchOwnedByUser = async (pitchId, userId) => {
  const [rows] = await pool.query(`
    SELECT p.id
    FROM pitches p
    JOIN owners o ON p.owner_id = o.id
    WHERE p.id = ? AND o.user_id = ?
  `, [pitchId, userId])

  if (rows.length === 0) {
    throw new Error('Du eier ikke denne banen eller den finnes ikke.')
  }
}

export const createRecurringAvailability = async ({ pitchId, weekday, startTime, endTime, effectiveFrom, effectiveTo = null }) => {
  const [res] = await pool.query(`
    INSERT INTO pitch_recurring_availability (pitch_id, weekday, start_time, end_time, effective_from, effective_to)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [pitchId, weekday, startTime, endTime, effectiveFrom, effectiveTo])

  return { id: res.insertId, pitchId, weekday, startTime, endTime, effectiveFrom, effectiveTo }
}

export const createSingleAvailability = async ({ pitchId, startDatetime, endDatetime }) => {
  const [res] = await pool.query(`
    INSERT INTO pitch_single_availability (pitch_id, start_datetime, end_datetime)
    VALUES (?, ?, ?)
  `, [pitchId, startDatetime, endDatetime])

  return { id: res.insertId, pitchId, startDatetime, endDatetime }
}

export const createBlackout = async ({ pitchId, startDatetime, endDatetime, reason }) => {
  const [res] = await pool.query(`
    INSERT INTO pitch_blackouts (pitch_id, start_datetime, end_datetime, reason)
    VALUES (?, ?, ?, ?)
  `, [pitchId, startDatetime, endDatetime, reason || null])

  return { id: res.insertId, pitchId, startDatetime, endDatetime, reason: reason || null }
}

export const fetchPitchAvailability = async (pitchId) => {
  const [recurring] = await pool.query(`SELECT * FROM pitch_recurring_availability WHERE pitch_id = ? ORDER BY weekday, start_time`, [pitchId])
  const [single] = await pool.query(`SELECT * FROM pitch_single_availability WHERE pitch_id = ? ORDER BY start_datetime`, [pitchId])
  const [blackouts] = await pool.query(`SELECT * FROM pitch_blackouts WHERE pitch_id = ? ORDER BY start_datetime`, [pitchId])
  return { recurring, single, blackouts }
}

/**
 * Finn baner som er tilgjengelige i et intervall (date + start/end klokkeslett).
 * - Treffer hvis: (one-off åpning som dekker intervallet) ELLER (ukentlig regel som dekker intervallet)
 * - OG: ikke svartelistet og ikke allerede booket i intervallet
 * - Valgfrie filtre: city, size
 */
export const searchAvailablePitches = async ({ date, start, end, city, size }) => {
  // Bygg parametre
  const startDt = `${date} ${start}:00`
  const endDt = `${date} ${end}:00`

  // weekday: 0=søn..6=lør, MySQL: DAYOFWEEK() gir 1=søn..7=lør, så weekday = DAYOFWEEK(date) - 1
  const [rows] = await pool.query(`
    WITH req AS (
      SELECT TIMESTAMP(?) AS start_dt, TIMESTAMP(?) AS end_dt,
             (DAYOFWEEK(?)-1) AS req_wd, TIME(?) AS req_start_t, TIME(?) AS req_end_t, DATE(?) AS req_d
    )
    SELECT
      p.id, p.name, p.size, p.location, p.price, p.surface, p.hasLockerRoom, p.image,
      u.name AS ownerName
    FROM pitches p
    JOIN owners o ON p.owner_id = o.id
    JOIN users u ON o.user_id = u.id
    JOIN req r
    WHERE
      -- (A) One-off åpning som dekker hele intervallet
      (
        EXISTS (
          SELECT 1 FROM pitch_single_availability sa
          WHERE sa.pitch_id = p.id
            AND sa.start_datetime <= r.start_dt
            AND sa.end_datetime   >= r.end_dt
        )
        OR
      -- (B) Ukentlig regel som dekker intervallet på gitt dato
        EXISTS (
          SELECT 1 FROM pitch_recurring_availability ra
          WHERE ra.pitch_id = p.id
            AND ra.weekday = r.req_wd
            AND (ra.effective_from <= r.req_d)
            AND (ra.effective_to IS NULL OR ra.effective_to >= r.req_d)
            AND ra.start_time <= r.req_start_t
            AND ra.end_time   >= r.req_end_t
        )
      )
      -- (C) Ikke i blackout
      AND NOT EXISTS (
        SELECT 1 FROM pitch_blackouts b
        WHERE b.pitch_id = p.id
          AND b.start_datetime < r.end_dt
          AND b.end_datetime   > r.start_dt
      )
      -- (D) Ikke allerede booket
      AND NOT EXISTS (
        SELECT 1 FROM bookings bk
        WHERE bk.pitch_id = p.id
          AND bk.status = 'confirmed'
          AND bk.start_datetime < r.end_dt
          AND bk.end_datetime   > r.start_dt
      )
      -- (E) Filtre
      ${city ? `AND p.location = ?` : ``}
      ${size ? `AND p.size = ?` : ``}
  `, city && size ? [startDt, endDt, date, start, end, date, city, size]
     : city ? [startDt, endDt, date, start, end, date, city]
     : size ? [startDt, endDt, date, start, end, date, size]
     : [startDt, endDt, date, start, end, date])

  return rows
}

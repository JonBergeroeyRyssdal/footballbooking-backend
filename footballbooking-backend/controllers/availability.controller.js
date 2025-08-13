// /controllers/availability.controller.js
import {
  ensurePitchOwnedByUser,
  createRecurringAvailability,
  createSingleAvailability,
  createBlackout,
  fetchPitchAvailability
} from '../services/availability.service.js'

export const addRecurringAvailability = async (req, res) => {
  try {
    const { pitchId } = req.params
    const { weekday, startTime, endTime, effectiveFrom, effectiveTo } = req.body
    const userId = req.user.id

    await ensurePitchOwnedByUser(pitchId, userId)
    const row = await createRecurringAvailability({ pitchId, weekday, startTime, endTime, effectiveFrom, effectiveTo })
    res.status(201).json(row)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}

export const addSingleAvailability = async (req, res) => {
  try {
    const { pitchId } = req.params
    const { startDatetime, endDatetime } = req.body
    const userId = req.user.id

    await ensurePitchOwnedByUser(pitchId, userId)
    const row = await createSingleAvailability({ pitchId, startDatetime, endDatetime })
    res.status(201).json(row)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}

export const addBlackout = async (req, res) => {
  try {
    const { pitchId } = req.params
    const { startDatetime, endDatetime, reason } = req.body
    const userId = req.user.id

    await ensurePitchOwnedByUser(pitchId, userId)
    const row = await createBlackout({ pitchId, startDatetime, endDatetime, reason })
    res.status(201).json(row)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}

export const getPitchAvailability = async (req, res) => {
  try {
    const { pitchId } = req.params
    const data = await fetchPitchAvailability(pitchId)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}

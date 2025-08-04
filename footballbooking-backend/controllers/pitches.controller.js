import { createPitchService, getPitchesByUserId, getAllPitchesService, getRandomPitchesService } from '../services/pitches.service.js'

export const createPitch = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, size, location } = req.body

    if (!name || !size || !location) {
      return res.status(400).json({ message: 'Alle felt er påkrevd' })
    }

    const newPitch = await createPitchService({ userId, name, size, location })
    res.status(201).json(newPitch)
  } catch (err) {
    console.error('Feil ved oppretting av bane:', err.message)
    res.status(500).json({ message: err.message || 'Serverfeil' })
  }
}

export const getMyPitches = async (req, res) => {
  try {
    const userId = req.user.id
    const pitches = await getPitchesByUserId(userId)
    res.json(pitches)
  } catch (err) {
    console.error('Feil ved henting av baner:', err)
    res.status(500).json({ message: 'Kunne ikke hente baner' })
  }
}

export const getAllPitches = async (req, res) => {
  try {
    const pitches = await getAllPitchesService()
    res.json(pitches)
  } catch (err) {
    console.error('Feil ved henting av alle baner:', err)
    res.status(500).json({ message: 'Kunne ikke hente baner' })
  }
}

export const getRandomPitches = async (req, res) => {
  try {
    const pitches = await getRandomPitchesService(3) // Eller juster antall
    res.json(pitches)
  } catch (err) {
    console.error('Feil ved henting av utvalgte baner:', err)
    res.status(500).json({ message: 'Kunne ikke hente utvalgte baner' })
  }
}


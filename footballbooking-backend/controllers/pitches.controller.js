import {
  createPitchService,
  getPitchesByUserId,
  getAllPitchesService,
  getRandomPitchesService,
  getPitchByIdService
} from "../services/pitches.service.js";
import { searchAvailablePitches } from '../services/availability.service.js'

export const createPitch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, size, location, price, surface, hasLockerRoom, image } = req.body;

    // Sjekk påkrevd input
    if (!name || !size || !location || price === undefined || !surface) {
      return res.status(400).json({ message: "Alle felt er påkrevd" });
    }

    const newPitch = await createPitchService({
      userId,
      name,
      size,
      location,
      price,
      surface,
      hasLockerRoom: !!hasLockerRoom,
      image
    });

    res.status(201).json(newPitch);
  } catch (err) {
    console.error("Feil ved oppretting av bane:", err.message);
    res.status(500).json({ message: err.message || "Serverfeil" });
  }
};


export const getMyPitches = async (req, res) => {
  try {
    const userId = req.user.id;
    const pitches = await getPitchesByUserId(userId);
    res.json(pitches);
  } catch (err) {
    console.error("Feil ved henting av baner:", err);
    res.status(500).json({ message: "Kunne ikke hente baner" });
  }
};

export const getAllPitches = async (req, res) => {
  try {
    const pitches = await getAllPitchesService();
    res.json(pitches);
  } catch (err) {
    console.error("Feil ved henting av alle baner:", err);
    res.status(500).json({ message: "Kunne ikke hente baner" });
  }
};

export const getRandomPitches = async (req, res) => {
  try {
    const pitches = await getRandomPitchesService(3); // Eller juster antall
    res.json(pitches);
  } catch (err) {
    console.error("Feil ved henting av utvalgte baner:", err);
    res.status(500).json({ message: "Kunne ikke hente utvalgte baner" });
  }
};

export const getPitchById = async (req, res) => {
  try {
    const pitchId = req.params.id;
    const pitch = await getPitchByIdService(pitchId);

    if (!pitch) {
      return res.status(404).json({ message: "Bane ikke funnet" });
    }

    res.json(pitch);
  } catch (err) {
    console.error("Feil ved henting av bane:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
};


// Hent total telling av brukere, eiere og baner
export const getAdminCounts = async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(`SELECT COUNT(*) AS userCount FROM users WHERE role = 'user'`)
    const [[{ ownerCount }]] = await pool.query(`SELECT COUNT(*) AS ownerCount FROM users WHERE role = 'owner'`)
    const [[{ pitchCount }]] = await pool.query(`SELECT COUNT(*) AS pitchCount FROM pitches`)

    res.json({ userCount, ownerCount, pitchCount })
  } catch (err) {
    console.error('Feil ved telling av brukere, eiere og baner:', err)
    res.status(500).json({ message: 'Kunne ikke hente tellinger' })
  }
}

export const findAvailablePitches = async (req, res) => {
  try {
    const { date, start, end, city, size } = req.query
    if (!date || !start || !end) {
      return res.status(400).json({ error: 'Mangler påkrevde parametre: date, start, end' })
    }
    const rows = await searchAvailablePitches({ date, start, end, city, size })
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
}



// /routes/availability.routes.js
import express from 'express'
import { verifyToken, verifyOwner } from '../middleware/auth.middleware.js'
import {
  addRecurringAvailability,
  addSingleAvailability,
  addBlackout,
  getPitchAvailability,
} from '../controllers/availability.controller.js'

const router = express.Router()

// Eiere setter tilgjengelighet for en spesifikk pitch
router.post('/:pitchId/recurring', verifyToken, verifyOwner, addRecurringAvailability)
router.post('/:pitchId/oneoff', verifyToken, verifyOwner, addSingleAvailability)
router.post('/:pitchId/blackout', verifyToken, verifyOwner, addBlackout)

// Hente all tilgjengelighet for en pitch (ukentlig + enkeltøkter + blackouts)
router.get('/:pitchId', getPitchAvailability)

export default router

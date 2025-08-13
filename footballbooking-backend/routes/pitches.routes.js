import express from 'express'
import {
  createPitch,
  getMyPitches,
  getAllPitches,
  getRandomPitches,
  getPitchById,
  findAvailablePitches
} from '../controllers/pitches.controller.js'
import { verifyToken, verifyOwner } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, verifyOwner, createPitch)
router.get('/mine', verifyToken, verifyOwner, getMyPitches)
router.get('/available', getAllPitches)
router.get('/featured', getRandomPitches)
router.get('/search-available', findAvailablePitches) // ← må stå før /:id
router.get('/:id', getPitchById)

export default router




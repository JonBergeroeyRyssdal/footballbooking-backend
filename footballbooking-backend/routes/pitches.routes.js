import express from 'express'
import {
  createPitch,
  getMyPitches,
  getAllPitches,
  getRandomPitches,
  getPitchById
} from '../controllers/pitches.controller.js'
import { verifyToken, verifyOwner } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, verifyOwner, createPitch)
router.get('/mine', verifyToken, verifyOwner, getMyPitches)
router.get('/available', getAllPitches) // 👈 NY
router.get('/featured', getRandomPitches) // 👈 ny route
router.get('/:id', getPitchById) // 👈 NY


export default router



import express from 'express'
import {
  createPitch,
  getMyPitches,
  getAllPitches
} from '../controllers/pitches.controller.js'
import { verifyToken, verifyOwner } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', verifyToken, verifyOwner, createPitch)
router.get('/mine', verifyToken, verifyOwner, getMyPitches)
router.get('/available', getAllPitches) // 👈 NY

export default router



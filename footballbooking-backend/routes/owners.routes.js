import express from 'express'
import { registerOwner, loginOwner } from '../controllers/owners.controller.js'

const router = express.Router()

router.post('/register', registerOwner)
router.post('/login', loginOwner) // 👈 Ny rute

export default router


import express from 'express'
import { registerOwner } from '../controllers/owners.controller.js'

const router = express.Router()

router.post('/register', registerOwner)

export default router

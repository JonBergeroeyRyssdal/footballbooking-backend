import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js'
import { getAllUsers, getAllOwners, getUserCounts } from '../controllers/admin.controller.js'

const router = express.Router()

router.get('/users', verifyToken, verifyAdmin, getAllUsers)
router.get('/owners', verifyToken, verifyAdmin, getAllOwners)
router.get('/counts', verifyToken, verifyAdmin, getUserCounts) // 👈 NY RUTE

export default router


import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js'
import { getAllUsers, getAllOwners, getUserCounts, getPitchesByOwner, getAdminCounts } from '../controllers/admin.controller.js'

const router = express.Router()

router.get('/users', verifyToken, verifyAdmin, getAllUsers)
router.get('/owners', verifyToken, verifyAdmin, getAllOwners)
router.get('/counts', verifyToken, verifyAdmin, getAdminCounts)

router.get('/owners/:ownerId/pitches', verifyToken, verifyAdmin, getPitchesByOwner);

export default router


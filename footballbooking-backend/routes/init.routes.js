// /routes/init.routes.js
import express from 'express';
import { initializeDatabase } from '../controllers/init.controller.js';

const router = express.Router();

// Bytt fra GET til POST her
router.post('/', initializeDatabase);

export default router;


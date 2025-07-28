// routes/auth.routes.js
import express from 'express';
import { registerOwner, loginUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginUser);

export default router;

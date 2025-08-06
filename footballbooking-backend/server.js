// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })) // eller høyere, f.eks. 10mb


// Eksempel på riktig route-bruk
// import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes); // userRoutes må være en express.Router()

import initRoutes from './routes/init.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ownersRoutes from './routes/owners.routes.js';
import initAdminRoute from './routes/initAdmin.route.js'
import pitchRoutes from './routes/pitches.routes.js'
import adminRoutes from './routes/admin.routes.js'

app.get('/', (req, res) => {
  res.send('API fungerer!');
});
app.use('/api/init', initRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owners', ownersRoutes)
app.use('/api/tools', initAdminRoute)
app.use('/api/pitches', pitchRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});

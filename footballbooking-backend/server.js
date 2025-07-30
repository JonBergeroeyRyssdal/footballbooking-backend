// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Eksempel på riktig route-bruk
// import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes); // userRoutes må være en express.Router()

import initRoutes from './routes/init.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ownersRoutes from './routes/owners.routes.js';

app.get('/', (req, res) => {
  res.send('API fungerer!');
});
app.use('/api/init', initRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owners', ownersRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});

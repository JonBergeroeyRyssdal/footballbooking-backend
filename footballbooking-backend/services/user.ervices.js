// services/user.service.js
import bcrypt from 'bcrypt';
import { createUser, createUserProfile, getUserByEmail } from '../models/user.model.js';

export const registerUserService = async ({ name, email, password, phone }) => {
  if (!name || !email || !password || !phone) {
    throw new Error('Alle felter er påkrevd');
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('E-post er allerede registrert');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await createUser(name, email, hashedPassword, 'user');
  await createUserProfile(userId, phone);

  return userId;
};

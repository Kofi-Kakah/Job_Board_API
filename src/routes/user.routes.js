import express from 'express';
import { getMyProfile, updateMyProfile, searchCandidates } from '../controllers/user.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const userRoutes = express.Router();

userRoutes.use(authenticate);
userRoutes.get('/candidates/search', searchCandidates);
userRoutes.get('/me', getMyProfile);
userRoutes.patch('/me', updateMyProfile);

export default userRoutes;

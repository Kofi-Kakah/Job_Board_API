import express from 'express';
import { addExperience, updateExperience, deleteExperience } from '../controllers/experience.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const experienceRoutes = express.Router();

experienceRoutes.use(authenticate);
experienceRoutes.post('/', addExperience);
experienceRoutes.patch('/:experienceId', updateExperience);
experienceRoutes.delete('/:experienceId', deleteExperience);

export default experienceRoutes;

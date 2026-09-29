import express from 'express';
import { addEducation, updateEducation, deleteEducation } from '../controllers/education.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const educationRoutes = express.Router();

educationRoutes.use(authenticate);
educationRoutes.post('/', addEducation);
educationRoutes.patch('/:educationId', updateEducation);
educationRoutes.delete('/:educationId', deleteEducation);

export default educationRoutes;

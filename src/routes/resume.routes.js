import express from 'express';
import { addResume, listMyResumes, setDefaultResume, deleteResume } from '../controllers/resume.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const resumeRoutes = express.Router();

resumeRoutes.use(authenticate);
resumeRoutes.route('/')
    .get(listMyResumes)
    .post(addResume);
resumeRoutes.patch('/:resumeId/default', setDefaultResume);
resumeRoutes.delete('/:resumeId', deleteResume);

export default resumeRoutes;

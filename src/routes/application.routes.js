import express from 'express';
import { applyToJob, listMyApplications, withdrawApplication } from '../controllers/application.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const applicationRoutes = express.Router();

applicationRoutes.use(authenticate);
applicationRoutes.get('/me', listMyApplications);
applicationRoutes.post('/jobs/:jobId/applications', applyToJob);
applicationRoutes.patch('/:applicationId/withdraw', withdrawApplication);

export default applicationRoutes;

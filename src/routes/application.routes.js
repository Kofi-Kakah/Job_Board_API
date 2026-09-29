import express from 'express';
import {
    applyToJob,
    listMyApplications,
    withdrawApplication,
    listJobApplications,
    updateApplicationStatus,
} from '../controllers/application.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const applicationRoutes = express.Router();

applicationRoutes.use(authenticate);
applicationRoutes.get('/applications/me', listMyApplications);
applicationRoutes.route('/jobs/:jobId/applications')
    .get(listJobApplications)
    .post(applyToJob);
applicationRoutes.patch('/applications/:applicationId/status', updateApplicationStatus);
applicationRoutes.patch('/applications/:applicationId/withdraw', withdrawApplication);

export default applicationRoutes;

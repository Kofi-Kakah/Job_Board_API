import express from 'express';
import { createJob, searchJobs, getJob, listMyJobs, updateJob, closeJob } from '../controllers/job.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const jobRoutes = express.Router();

jobRoutes.get('/search', searchJobs);
jobRoutes.get('/mine', authenticate, listMyJobs);
jobRoutes.post('/', authenticate, createJob);
jobRoutes.get('/:jobId', getJob);
jobRoutes.patch('/:jobId', authenticate, updateJob);
jobRoutes.patch('/:jobId/close', authenticate, closeJob);

export default jobRoutes;

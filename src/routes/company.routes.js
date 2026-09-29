import express from 'express';
import { createCompany, getCompany, updateCompany, deleteCompany } from '../controllers/company.controllers.js';
import { authenticate } from '../middleware/auth.middleware.js';

const companyRoutes = express.Router();

companyRoutes.use(authenticate);
companyRoutes.post('/', createCompany);
companyRoutes.get('/:companyId', getCompany);
companyRoutes.patch('/:companyId', updateCompany);
companyRoutes.delete('/:companyId', deleteCompany);

export default companyRoutes;

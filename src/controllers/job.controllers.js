import mongoose from 'mongoose';
import Job from '../../models/job.model.js';
import Company from '../../models/company.model.js';
import User from '../../models/user.model.js';

const employmentTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance'];
const workplaceTypes = ['remote', 'hybrid', 'onsite'];
const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
const editableFields = [
    'title', 'description', 'responsibilities', 'requirements', 'skills', 'location',
    'employmentType', 'workplaceType', 'experienceLevel', 'yearsExperienceMin',
    'salary', 'applicationDeadline',
];

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseList = value => Array.isArray(value) ? value : String(value).split(',').map(item => item.trim()).filter(Boolean);

export const createJob = async (req, res) => {
    try {
        if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employer account required.' });
        const { companyId } = req.body;
        if (!mongoose.isValidObjectId(companyId)) return res.status(400).json({ message: 'A valid companyId is required.' });
        const company = await Company.findOne({ _id: companyId, owner: req.user.id });
        if (!company) return res.status(404).json({ message: 'Company not found or not owned by you.' });

        const data = Object.fromEntries(editableFields
            .filter(field => Object.hasOwn(req.body, field))
            .map(field => [field, req.body[field]]));
        const job = await Job.create({ ...data, company: company._id, postedBy: req.user.id });
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { postedJobs: job._id } });
        return res.status(201).json({ job });
    } catch (error) {
        return res.status(400).json({ message: 'Could not create job.', error: error.message });
    }
};

export const searchJobs = async (req, res) => {
    try {
        const filter = { status: 'open' };
        for (const field of ['city', 'region', 'country', 'title']) {
            if (req.query[field]) {
                const path = field === 'title' ? 'title' : `location.${field}`;
                filter[path] = new RegExp(escapeRegex(String(req.query[field]).trim()), 'i');
            }
        }
        for (const field of ['employmentType', 'workplaceType', 'experienceLevel']) {
            if (req.query[field]) {
                const allowed = field === 'employmentType' ? employmentTypes
                    : field === 'workplaceType' ? workplaceTypes : experienceLevels;
                const values = parseList(req.query[field]);
                if (values.some(value => !allowed.includes(value))) {
                    return res.status(400).json({ message: `Invalid ${field} filter.` });
                }
                filter[field] = values.length === 1 ? values[0] : { $in: values };
            }
        }
        if (req.query.skills) filter.skills = { $in: parseList(req.query.skills).map(skill => new RegExp(`^${escapeRegex(skill)}$`, 'i')) };
        if (req.query.salaryMin !== undefined) {
            const salaryMin = Number(req.query.salaryMin);
            if (!Number.isFinite(salaryMin) || salaryMin < 0) return res.status(400).json({ message: 'salaryMin must be a non-negative number.' });
            filter['salary.max'] = { $gte: salaryMin };
        }
        if (req.query.salaryMax !== undefined) {
            const salaryMax = Number(req.query.salaryMax);
            if (!Number.isFinite(salaryMax) || salaryMax < 0) return res.status(400).json({ message: 'salaryMax must be a non-negative number.' });
            filter['salary.min'] = { $lte: salaryMax };
        }

        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const [jobs, total] = await Promise.all([
            Job.find(filter).populate('company', 'name logoUrl location website').sort({ createdAt: -1 })
                .skip((page - 1) * limit).limit(limit).lean(),
            Job.countDocuments(filter),
        ]);
        return res.json({ jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        return res.status(500).json({ message: 'Could not search jobs.', error: error.message });
    }
};

export const getJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, status: 'open' })
            .populate('company', 'name description logoUrl location website industry size');
        if (!job) return res.status(404).json({ message: 'Open job not found.' });
        return res.json({ job });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid job ID.', error: error.message });
    }
};

export const listMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employer account required.' });
        const filter = { postedBy: req.user.id };
        if (req.query.status && ['draft', 'open', 'closed'].includes(req.query.status)) filter.status = req.query.status;
        const jobs = await Job.find(filter).populate('company', 'name logoUrl').sort({ createdAt: -1 });
        return res.json({ jobs });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load your jobs.', error: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const updates = Object.fromEntries(editableFields
            .filter(field => Object.hasOwn(req.body, field))
            .map(field => [field, req.body[field]]));
        const job = await Job.findOneAndUpdate(
            { _id: req.params.jobId, postedBy: req.user.id, status: { $ne: 'closed' } },
            { $set: updates }, { new: true, runValidators: true },
        );
        if (!job) return res.status(404).json({ message: 'Editable job not found or not owned by you.' });
        return res.json({ job });
    } catch (error) {
        return res.status(400).json({ message: 'Could not update job.', error: error.message });
    }
};

export const closeJob = async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.jobId, postedBy: req.user.id, status: { $ne: 'closed' } },
            { $set: { status: 'closed', closedAt: new Date() } },
            { new: true, runValidators: true },
        );
        if (!job) return res.status(404).json({ message: 'Open job not found or not owned by you.' });
        return res.json({ message: 'Job closed.', job });
    } catch (error) {
        return res.status(400).json({ message: 'Could not close job.', error: error.message });
    }
};

import mongoose from 'mongoose';
import Application from '../../models/application.model.js';
import User from '../../models/user.model.js';

export const applyToJob = async (req, res) => {
    try {
        if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Candidate account required.' });
        const { jobId } = req.params;
        if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ message: 'Invalid job ID.' });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (req.body.resume && !user.resumes.some(id => id.equals(req.body.resume))) {
            return res.status(400).json({ message: 'Resume must belong to your profile.' });
        }
        const application = await Application.create({
            job: jobId, candidate: user._id, resume: req.body.resume,
        });
        user.applications.addToSet(application._id);
        await user.save();
        return res.status(201).json({ application });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'You already applied to this job.' });
        return res.status(400).json({ message: 'Could not submit application.', error: error.message });
    }
};

export const listMyApplications = async (req, res) => {
    try {
        const filter = { candidate: req.user.id };
        if (req.query.status) filter.status = req.query.status;
        const applications = await Application.find(filter).populate('resume').sort({ appliedAt: -1 });
        return res.json({ applications });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load applications.', error: error.message });
    }
};

export const withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findOneAndUpdate(
            { _id: req.params.applicationId, candidate: req.user.id, status: { $nin: ['rejected', 'withdrawn'] } },
            { $set: { status: 'withdrawn', lastUpdatedAt: new Date() } },
            { new: true, runValidators: true },
        );
        if (!application) return res.status(404).json({ message: 'Application not found or cannot be withdrawn.' });
        return res.json({ application });
    } catch (error) {
        return res.status(400).json({ message: 'Could not withdraw application.', error: error.message });
    }
};

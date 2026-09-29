import Resume from '../../models/resume.model.js';
import User from '../../models/user.model.js';

export const addResume = async (req, res) => {
    try {
        const [resume, user] = await Promise.all([Resume.create(req.body), User.findById(req.user.id)]);
        if (!user) { await Resume.findByIdAndDelete(resume._id); return res.status(404).json({ message: 'User not found.' }); }
        if (resume.isDefault) await Resume.updateMany({ _id: { $in: user.resumes } }, { $set: { isDefault: false } });
        else if (user.resumes.length === 0) { resume.isDefault = true; await resume.save(); }
        user.resumes.addToSet(resume._id);
        await user.save();
        return res.status(201).json({ resume });
    } catch (error) {
        return res.status(400).json({ message: 'Could not add resume.', error: error.message });
    }
};

export const listMyResumes = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('resumes');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json({ resumes: user.resumes });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load resumes.', error: error.message });
    }
};

export const setDefaultResume = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id, resumes: req.params.resumeId });
        if (!user) return res.status(404).json({ message: 'Resume not found.' });
        await Resume.updateMany({ _id: { $in: user.resumes } }, { $set: { isDefault: false } });
        const resume = await Resume.findByIdAndUpdate(req.params.resumeId, { $set: { isDefault: true } }, { new: true });
        return res.json({ resume });
    } catch (error) {
        return res.status(400).json({ message: 'Could not set default resume.', error: error.message });
    }
};

export const deleteResume = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, resumes: req.params.resumeId },
            { $pull: { resumes: req.params.resumeId } }, { new: true },
        );
        if (!user) return res.status(404).json({ message: 'Resume not found.' });
        const resume = await Resume.findByIdAndDelete(req.params.resumeId);
        if (resume?.isDefault && user.resumes.length) {
            await Resume.findByIdAndUpdate(user.resumes[0], { $set: { isDefault: true } });
        }
        return res.json({ message: 'Resume metadata deleted.' });
    } catch (error) {
        return res.status(400).json({ message: 'Could not delete resume.', error: error.message });
    }
};

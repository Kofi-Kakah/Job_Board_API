import Experience from '../../models/experience.model.js';
import User from '../../models/user.model.js';

export const addExperience = async (req, res) => {
    try {
        const [experience, user] = await Promise.all([
            Experience.create(req.body), User.findById(req.user.id),
        ]);
        if (!user) { await Experience.findByIdAndDelete(experience._id); return res.status(404).json({ message: 'User not found.' }); }
        user.experience.addToSet(experience._id);
        await user.save();
        return res.status(201).json({ experience });
    } catch (error) {
        return res.status(400).json({ message: 'Could not add experience.', error: error.message });
    }
};

export const updateExperience = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id, experience: req.params.experienceId });
        if (!user) return res.status(404).json({ message: 'Experience not found.' });
        const experience = await Experience.findByIdAndUpdate(req.params.experienceId, { $set: req.body }, { new: true, runValidators: true });
        return res.json({ experience });
    } catch (error) {
        return res.status(400).json({ message: 'Could not update experience.', error: error.message });
    }
};

export const deleteExperience = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, experience: req.params.experienceId },
            { $pull: { experience: req.params.experienceId } }, { new: true },
        );
        if (!user) return res.status(404).json({ message: 'Experience not found.' });
        await Experience.findByIdAndDelete(req.params.experienceId);
        return res.json({ message: 'Experience deleted.' });
    } catch (error) {
        return res.status(400).json({ message: 'Could not delete experience.', error: error.message });
    }
};

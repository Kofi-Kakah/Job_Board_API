import Education from '../../models/education.model.js';
import User from '../../models/user.model.js';

export const addEducation = async (req, res) => {
    try {
        const [education, user] = await Promise.all([Education.create(req.body), User.findById(req.user.id)]);
        if (!user) { await Education.findByIdAndDelete(education._id); return res.status(404).json({ message: 'User not found.' }); }
        user.education.addToSet(education._id);
        await user.save();
        return res.status(201).json({ education });
    } catch (error) {
        return res.status(400).json({ message: 'Could not add education.', error: error.message });
    }
};

export const updateEducation = async (req, res) => {
    try {
        const owned = await User.exists({ _id: req.user.id, education: req.params.educationId });
        if (!owned) return res.status(404).json({ message: 'Education record not found.' });
        const education = await Education.findByIdAndUpdate(req.params.educationId, { $set: req.body }, { new: true, runValidators: true });
        return res.json({ education });
    } catch (error) {
        return res.status(400).json({ message: 'Could not update education.', error: error.message });
    }
};

export const deleteEducation = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.user.id, education: req.params.educationId },
            { $pull: { education: req.params.educationId } }, { new: true },
        );
        if (!user) return res.status(404).json({ message: 'Education record not found.' });
        await Education.findByIdAndDelete(req.params.educationId);
        return res.json({ message: 'Education record deleted.' });
    } catch (error) {
        return res.status(400).json({ message: 'Could not delete education.', error: error.message });
    }
};

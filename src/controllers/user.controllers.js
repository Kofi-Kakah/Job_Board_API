import User from '../../models/user.model.js';

const profileFields = [
    'firstName', 'lastName', 'headline', 'jobTitle', 'summary', 'profilePhotoUrl', 'phone',
    'location', 'skills', 'experienceLevel', 'yearsOfExperience', 'desiredEmploymentTypes',
    'desiredWorkplaceTypes', 'desiredSalary', 'openToWork', 'profileVisibility',
];

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('experience education resumes applications companies managedCompanies');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load profile.', error: error.message });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const updates = Object.fromEntries(profileFields
            .filter(field => Object.hasOwn(req.body, field))
            .map(field => [field, req.body[field]]));
        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, {
            new: true, runValidators: true,
        }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json({ message: 'Profile updated.', user });
    } catch (error) {
        return res.status(400).json({ message: 'Could not update profile.', error: error.message });
    }
};

export const searchCandidates = async (req, res) => {
    try {
        if (!['employer', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Employer access required.' });
        }
        const filter = { role: 'candidate', isActive: true, profileVisibility: 'public' };
        if (req.query.skills) filter.skills = { $in: req.query.skills.split(',').map(value => value.trim()) };
        if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');
        if (req.query.country) filter['location.country'] = new RegExp(req.query.country, 'i');
        if (req.query.experienceLevel) filter.experienceLevel = req.query.experienceLevel;
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const [candidates, total] = await Promise.all([
            User.find(filter).select('-password -email').skip((page - 1) * limit).limit(limit).lean(),
            User.countDocuments(filter),
        ]);
        return res.json({ candidates, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        return res.status(500).json({ message: 'Could not search candidates.', error: error.message });
    }
};

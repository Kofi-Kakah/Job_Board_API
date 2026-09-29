import Company from '../../models/company.model.js';
import User from '../../models/user.model.js';

export const createCompany = async (req, res) => {
    try {
        if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employer account required.' });
        const company = await Company.create({ ...req.body, owner: req.user.id });
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { companies: company._id, managedCompanies: company._id },
        });
        return res.status(201).json({ company });
    } catch (error) {
        return res.status(400).json({ message: 'Could not create company.', error: error.message });
    }
};

export const getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyId).populate('owner', 'username');
        if (!company) return res.status(404).json({ message: 'Company not found.' });
        return res.json({ company });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid company ID.', error: error.message });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const editableFields = ['name', 'description', 'website', 'industry', 'size', 'logoUrl', 'location'];
        const updates = Object.fromEntries(editableFields
            .filter(field => Object.hasOwn(req.body, field))
            .map(field => [field, req.body[field]]));
        const company = await Company.findOneAndUpdate(
            { _id: req.params.companyId, owner: req.user.id }, { $set: updates },
            { new: true, runValidators: true, projection: { owner: 1, name: 1, description: 1, website: 1, industry: 1, size: 1, logoUrl: 1, location: 1, updatedAt: 1 } },
        );
        if (!company) return res.status(404).json({ message: 'Company not found or not owned by you.' });
        return res.json({ company });
    } catch (error) {
        return res.status(400).json({ message: 'Could not update company.', error: error.message });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findOneAndDelete({ _id: req.params.companyId, owner: req.user.id });
        if (!company) return res.status(404).json({ message: 'Company not found or not owned by you.' });
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { companies: company._id, managedCompanies: company._id },
        });
        return res.json({ message: 'Company deleted.' });
    } catch (error) {
        return res.status(400).json({ message: 'Could not delete company.', error: error.message });
    }
};

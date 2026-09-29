import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 12000 },
    responsibilities: [{ type: String, trim: true, maxlength: 1000 }],
    requirements: [{ type: String, trim: true, maxlength: 1000 }],
    skills: [{ type: String, trim: true, maxlength: 80 }],
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        city: { type: String, trim: true },
        region: { type: String, trim: true },
        country: { type: String, trim: true },
    },
    employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance'],
        required: true,
    },
    workplaceType: { type: String, enum: ['remote', 'hybrid', 'onsite'], required: true },
    experienceLevel: { type: String, enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'] },
    yearsExperienceMin: { type: Number, min: 0, max: 80 },
    salary: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 },
        currency: { type: String, uppercase: true, trim: true, maxlength: 3 },
        period: { type: String, enum: ['hour', 'month', 'year'] },
    },
    status: { type: String, enum: ['draft', 'open', 'closed'], default: 'open', index: true },
    applicationDeadline: { type: Date },
    closedAt: { type: Date },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, 'location.country': 1, 'location.city': 1, employmentType: 1, workplaceType: 1 });
jobSchema.index({ postedBy: 1, status: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;

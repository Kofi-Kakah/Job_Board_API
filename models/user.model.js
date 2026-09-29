import mongoose from 'mongoose';
import Resume from './resume.model.js';
import Experience from './experience.model.js';
import Education from './education.model.js';
import Application from './application.model.js';
import Company from './company.model.js';

const { Schema } = mongoose;

const userSchema = new Schema({
    // Shared account and authentication fields.
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        minlength: 3, 
        maxlength: 50 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        maxlength: 254 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8 
    },
    role: { 
        type: String, 
        enum: ['candidate', 'employer', 'admin'], 
        default: 'candidate', 
        index: true 
    },
    isEmailVerified: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },

    // Candidate profile. Optional for employer accounts.
    firstName: { 
        type: String, 
        trim: true, 
        maxlength: 80 
    },
    lastName: { 
        type: String, 
        trim: true, 
        maxlength: 80 
    },
    headline: { 
        type: String, 
        trim: true, 
        maxlength: 160 
    },
    jobTitle: { 
        type: String, 
        trim: true, 
        maxlength: 160 
    },
    summary: { 
        type: String, 
        trim: true, 
        maxlength: 5000 
    },
    profilePhotoUrl: { 
        type: String, 
        trim: true 
    },
    phone: { 
        type: String, 
        trim: true, 
        maxlength: 40 
    },
    location: {
        city: { 
            type: String, 
            trim: true 
        },
        region: { 
            type: String, 
            trim: true 
        },
        country: { 
            type: String, 
            trim: true 
        },
        // GeoJSON point [longitude, latitude], useful for proximity search.
        coordinates: {
            type: { 
                type: String, 
                enum: ['Point'] 
            },
            coordinates: { 
                type: [Number], 
                validate: {
                validator: value => value.length === 0 || value.length === 2,
                message: 'Coordinates must contain longitude and latitude.',
            } },
        },
    },
    skills: [{ 
        type: String, 
        trim: true, 
        maxlength: 80 
    }],
    experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    },
    yearsOfExperience: { 
        type: Number, 
        min: 0, 
        max: 80 
    },
    experience: [{ 
        type: Schema.Types.ObjectId, 
        ref: Experience.modelName 
    }],
    education: [{ 
        type: Schema.Types.ObjectId, 
        ref: Education.modelName 
    }],
    resumes: [{ 
        type: Schema.Types.ObjectId, 
        ref: Resume.modelName 
    }],
    desiredEmploymentTypes: [{
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance'],
    }],
    desiredWorkplaceTypes: [{ 
        type: String, 
        enum: ['remote', 'hybrid', 'onsite'] 
    }],
    desiredSalary: {
        min: { 
            type: Number, 
            min: 0 
        },
        max: { 
            type: Number, 
            min: 0 
        },
        currency: { 
            type: String, 
            uppercase: true, 
            trim: true, 
            maxlength: 3 
        },
        period: { 
            type: String, 
            enum: ['hour', 'month', 'year'] 
        },
    },
    openToWork: { 
        type: Boolean, 
        default: true 
    },
    profileVisibility: { 
        type: String, 
        enum: ['public', 'private'], 
        default: 'public' 
    },
    savedJobs: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Job' 
    }],
    applications: [{ 
        type: Schema.Types.ObjectId, 
        ref: Application.modelName 
    }],

    // Employer profile. Companies and posted jobs can also be modelled separately
    // and referenced here as the application grows.
    companies: [{ 
        type: Schema.Types.ObjectId, 
        ref: Company.modelName 
    }],
    managedCompanies: [{ 
        type: Schema.Types.ObjectId, 
        ref: Company.modelName 
    }],
    postedJobs: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Job' 
    }],
}, {timestamps: true, minimize: false,}
);

userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ skills: 1, experienceLevel: 1 });
userSchema.index({ role: 1, 'location.country': 1, 'location.city': 1 });

const User = mongoose.model('User', userSchema);

export default User;

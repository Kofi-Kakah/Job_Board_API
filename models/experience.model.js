import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    company: { 
        type: String, 
        required: true, 
        trim: true 
    },
    location: { 
        type: String, 
        trim: true 
    },
    employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'freelance'],
    },
    startDate: { 
        type: Date 
    },
    endDate: { 
        type: Date 
    },
    current: { 
        type: Boolean, 
        default: false 
    },
    description: { 
        type: String, 
        trim: true, 
        maxlength: 5000 
    },
}, { timestamps: true });

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;

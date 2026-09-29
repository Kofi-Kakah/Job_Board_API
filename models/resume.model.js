import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        trim: true 
    },
    url: { 
        type: String, 
        required: true, 
        trim: true 
    },
    mimeType: { 
        type: String, 
        trim: true 
    },
    size: { 
        type: Number, 
        min: 0 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    },
    isDefault: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;

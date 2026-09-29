import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Job', required: true 
    },
    candidate: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    status: {
        type: String,
        enum: ['submitted', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'withdrawn'],
        default: 'submitted',
    },
    appliedAt: { 
        type: Date,
        default: Date.now 
    },
    lastUpdatedAt: { 
        type: Date, 
        default: Date.now 
    },
    resume: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Resume' 
    },
    notes: { 
        type: String, 
        trim: true, 
        maxlength: 2000 
    },
}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;

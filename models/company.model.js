import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true, 
        maxlength: 160 
    },
    description: { 
        type: String, 
        trim: true, 
        maxlength: 5000 
    },
    website: { 
        type: String, 
        trim: true 
    },
    industry: { 
            type: String, 
            trim: true 
    },
    size: { 
        type: String, 
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] 
    },
    logoUrl: { 
        type: String, 
        trim: true 
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
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { timestamps: true });

companySchema.index({ name: 1, 'location.country': 1 });

const Company = mongoose.model('Company', companySchema);

export default Company;

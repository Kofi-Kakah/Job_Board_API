import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
    institution: { 
        type: String, 
        required: true, 
        trim: true 
    },
    qualification: { 
        type: String, 
        trim: true 
    },
    fieldOfStudy: { 
        type: String, 
        trim: true 
    },
    startDate: { 
        type: Date 
    },
    endDate: {
        type: Date 
    },
    description: { 
        type: String,
        trim: true, 
        maxlength: 3000 
    },
}, { timestamps: true });

const Education = mongoose.model('Education', educationSchema);

export default Education;

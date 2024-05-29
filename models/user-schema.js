import mongoose from 'mongoose';

const imageLocationSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const plantFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 12,
    },
    isVerified: { type: Boolean },
    token: { type: String },
    imageLocations: [imageLocationSchema]
});

const plantTreeForm = mongoose.model("plan-tree-form", plantFormSchema);

export default plantTreeForm;

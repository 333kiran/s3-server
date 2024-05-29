import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minimum: 2,
        maximum: 50,
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
        minimum: 10,
        maximum: 12,
    },
    walletAddress: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        // required: true,
    },
    location: {
        type: Object,
        // required: true
    },
    timestamp: {
        type: String,
        // required: true,
    },
   
})

const Form = mongoose.model("plant-tree-form", formSchema);

export default Form;
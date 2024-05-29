import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
email:String
})

const Subscriber = mongoose.model("subscriberMailAddress",subscriberSchema);

export default Subscriber;
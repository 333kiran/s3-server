import Subscriber from "../models/newsletter-subscriber.js";

export const subscribeNewsletterByMail = async(req,res) => {
    try{
const {email} = req.body;
// console.log("email ->>",email);
const exists = await Subscriber.findOne({email:email});
if(exists){
    return res.status(401).json({
        message:"You have already subscribed"
    })
}else{
    const newUser = new Subscriber({ email: email }); 
    await newUser.save();
    res.status(200).json({
        message:"You have subscribed successfully",
        success:true,
        result:newUser
    })
}
    }catch(error){
        console.log("error while calling subscribeNewsletterByMail method:",error.message);
        res.status(500).json({
            message:error.message,
            sucess:false
        })
    }
}
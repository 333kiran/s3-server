import plantTreeForm from "../models/user-schema.js";
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY ,
  });

export const addPlantATreeForm = async(req,res) => {
    try{
      const {name,email,mobile,walletAddress,location} = req.body;
      const {imageUrl} = req.file;
      console.log("image:",req.file);
      console.log("values ->>",req.body)
      if (!name && !email && !mobile && !walletAddress && !imageUrl && !location){
        return res.status(402).json({
            message:"Please provide all required fields",
        })
      }else{
        // const exists = await plantTreeForm.findOne({email:email});
        // if(exists){
        //     return res.status(403).json({
        //         message:"This email already planted a tree and have KSN tokens",
        //     })
        // }else{

          const fileExtension = req.file.originalname.split('.').pop();
            const imageName = `${uuidv4()}.${fileExtension}`;
            const params = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: imageName,
              Body: req.file.buffer,
              
              ContentType: `image/${fileExtension}`,
            };
        
            await s3.upload(params).promise();

            const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${imageName}`;
        
            const newEntry = new plantTreeForm({name,email,mobile,walletAddress,imageUrl,location});
            const data = await newEntry.save();
            res.status(200).json({
                message:"You have planted a tree successfully",
                success: true,
                data:data
            })
        }
      // }
    }catch(error){
        console.log("error while calling addPlantATreeForm method:",error.message);
        res.status(500).json({
            message:error.message,
            sucess:false
        })
    }
}
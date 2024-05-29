// // plantTreeController.js
import plantTreeForm from "../models/user-schema.js";
// import Aws from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import multerS3 from 'multer-s3';

// dotenv.config();

// const s3 = new Aws.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });

// const upload = multer({
//     storage: multerS3({
//         s3,
//         bucket: process.env.S3_BUCKET_NAME,
//         acl: 'public-read',
//         metadata: (req, file, cb) => {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: (req, file, cb) => {
//             const fileExtension = file.originalname.split('.').pop();
//             const imageName = `${uuidv4()}.${fileExtension}`;
//             cb(null, imageName);
//         },
//     }),
// });

// export const addTreeForm = upload.single('image', async (req, res) => {
//     try {
//         const { name, email, mobile, walletAddress, location } = req.body;

//         if (!name || !email || !mobile || !walletAddress || !location) {
//             return res.status(400).json({
//                 message: "Please provide all required fields",
//             });
//         }

//         const exists = await plantTreeForm.findOne({ email });
//         if (exists) {
//             return res.status(403).json({
//                 message: "This email already planted a tree and has KSN tokens",
//             });
//         }

//         const imageUrl = req.file.location;

//         const newEntry = new plantTreeForm({
//             name,
//             email,
//             mobile,
//             walletAddress,
//             imageUrl,
//             location,
//         });

//         const data = await newEntry.save();

//         res.status(200).json({
//             message: "You have planted a tree successfully",
//             success: true,
//             data,
//         });
//     } catch (error) {
//         console.error("Error while calling addPlantATreeForm method:", error.message);
//         res.status(500).json({
//             message: "Internal Server Error",
//             success: false,
//         });
//     }
// });


export const addTreeForm = async (req, res) => {
    try {
        // const user = req.body;
        // console.log("file =>>", req.file);
        // const userData = {
        //     "name": user.name,
        //     "email": user.email,
        //     "mobile": user.mobile,
        //     "walletAddress": user.walletAddress,
        //     "imageUrl": (req.file) ? req.file.filename : null,
        //     "location": user.location,
           
        // }

        const {name,email,mobile,walletAddress,location} = req.body;
        const {image} = req.file;
        console.log("image:",req.file);
        console.log("values ->>",req.body)
        if (!name && !email && !mobile && !walletAddress && !image && !location){
          return res.status(402).json({
              message:"Please provide all required fields",
          })
        }else{
        const exists = await plantTreeForm.findOne({ email:email });
        if (exists) {
            return res.status(403).json({
                message: "This email already planted a tree and have KSN tokens",
            })
        } else {
            const newUser = new plantTreeForm({name,email,mobile,walletAddress,imageUrl:image,location});
            const data = await newUser.save();
            res.status(200).json({
                message: "You have planted a tree successfully",
                success: true,
                data: data
            })
        }
    }
    } catch (error) {
        console.log("error while calling addPlantATreeForm method:", error.message);
        res.status(500).json({
            message: error.message,
            sucess: false
        })
    }
}
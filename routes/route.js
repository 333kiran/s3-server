import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import authenticateToken from "../utils/authenticateToken.js";
// import {addTreeForm} from '../controllers/userController.js';
// import { addPlantATreeForm } from '../controllers/user-controller.js';
import {registerUser,handleUploadSelfie,mailVerifying,
    loginUser,getAllUsersList,getUserDetailsByEmail,forgotPasswordApi,resetPasswordApi} from '../controllers/form-controller.js';
    import {addArticles,fetchAllArticlesList,deleteArticleById,updateArticleById} from '../controllers/article-controller.js';
    import {subscribeNewsletterByMail} from '../controllers/subscriber-controller.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

//
// const s3 = new aws.S3({
//     accessKeyId:process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
// })

// const upload = multer({
//     storge:multerS3({
//         s3:s3,
//         bucket:process.env.S3_BUCKET_NAME,
//         metadata:function(req,file,cb){
//             cb(null,{fieldName: file.fieldname});
//         },
//         key: function(req,file,cb){
//             cb(null,Date.now()+"_"+file.originalname)
//         }
//     })
// })


// router.post('/submit-form',upload.single('imageUrl'),addPlantATreeForm);
// router.post('/uploadImage',upload.single('imageUrl'),handlePlantTreeForm);
// router.get("/getAllUesrInfo",getAllUesrInfo);
// router.get('/getUserData/:userId',getUserData);
// router.get('/getUserDataByEmail/:email',fetchUserInfoByEmail);
// router.get('/getUserDataByImage/:imageUrl',fetchUserInfoByImageName);
// router.delete('/deleteUserByIds',deleteUserByIds);

router.post('/register',registerUser);
router.put("/isMailVerified/:id", authenticateToken, mailVerifying);
router.post('/login',loginUser);
router.post('/forgot-password',forgotPasswordApi);
router.put('/reset-password/:id',authenticateToken,resetPasswordApi);
router.put('/sendselfie/:email',upload.single('imageUrl'),handleUploadSelfie);
router.get('/getAllUsersList',getAllUsersList);
router.get('/getUserDetailsByEmail/:email',getUserDetailsByEmail);
router.post('/addArticles',addArticles);
router.get('/fetchAllArticlesList',fetchAllArticlesList);
router.delete('/deleteArticle/:id',deleteArticleById);
router.put('/updateArticle/:id',updateArticleById);
router.post('/subscribe-newsletter',subscribeNewsletterByMail);

export default router;
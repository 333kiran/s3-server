import Form from "../models/form-schema.js";
import plantTreeForm from "../models/user-schema.js";
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/send-mail.js";

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();


export const handlePlantTreeForm = async (req, res) => {
  try {
    const { name, email, mobile, walletAddress, location } = req.body;
    const { imageUrl } = req.file;

    if (
      !name &&
      !email &&
      !mobile &&
      !walletAddress &&
      !imageUrl &&
      !location
    ) {
      return res.status(402).json({
        message: "Please provide all required fields",
      });
    } else {
      const allowedFileTypes = /jpeg|jpg/;
      if (!allowedFileTypes.test(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: " Only JPEG and JPG files are allowed.",
        });
      }

      const fileExtension = req.file.originalname.split(".").pop();
      // const imageName = `${uuidv4()}.${fileExtension}`;
      const imageName = req.file.originalname;
      const timestamp = new Date().toISOString();
      // Upload the file to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${imageName}`,
        Body: req.file.buffer,
        ContentType: `image/${fileExtension}`,
      };

      const s3Result = await s3.upload(params).promise();

      const formData = new Form({
        name,
        email,
        mobile,
        walletAddress,
        location,
        imageUrl: s3Result.Location,
        timestamp,
      });

      await formData.save();

            res.status(200).json({
                success: true,
                message: 'You have planted a tree successfully',
                fileUrl: s3Result.Location,
                formData: formData,
            });
        }

    } catch (error) {
        console.log("error while calling handlePlantTreeForm method:", error);
        res.status(500).json({
            message: error.message,
            sucess: false
        })
    }
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        console.log("Received values ->>", name, email, mobile,password);

        // Check if all required fields are provided
        if (!name || !email || !password || !mobile ) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }
        const exists = await plantTreeForm.findOne({email:email});
        if(exists){
        return  res.status(401).json({
            message:"User already registered!"
          })
        }else{

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object with the hashed password
        const newUser = new plantTreeForm({
            name,
            email,
            password: hashedPassword, // Save the hashed password
            mobile,
        });

        // Save the new user to the database
        await newUser.save();

 // Generating a verification token
 const token = jwt.sign(
  { userId: newUser.email },
  process.env.JWT_SECRET_KEY,
  { expiresIn: "20m" }
);
newUser.token = token;
await newUser.save();
console.log("signupToken", token);
// Sending a verification email
const randomLink = `https://kissantoken.io/verify-usermail?id=${newUser._id}&token=${token}`;
console.log("email-verify-link->>", randomLink);

await sendEmail(email, randomLink);

        res.status(201).json({
            success: true,
            message: 'You have registered successfully',
            formData: newUser,
        });
      
      }
    } catch (error) {
        console.log("Error while calling registerUser method", error);
        res.status(500).json({
            message: error.message
        });
    }
};

export const mailVerifying = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await plantTreeForm.findByIdAndUpdate(
      { _id: id },
      { isVerified: true },
      { new: true }
    );
    console.log("result->>", result);
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    } else {
      res.status(200).json({
        message: "user's email account verified successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log("error while calling mail verifying api method", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


export const loginUser = async (req,res) => {
    try {
        const { email, password } = req.body;
// console.log("values ->>",email,password);
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        // Find the user by email in the database
        const user = await plantTreeForm.findOne({ email });
// console.log("user ->>",user)
        // Check if user exists
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
// console.log("pswd ->>",isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

res.status(200).json({
    message:"You have logged in successfully",
    result:user,
    success:true

})

    } catch (error) {
        console.log("error while calling login user method ->",error);
        res.status(500).json({
            message:error.message
        })
    }
}



export const forgotPasswordApi = async (req, res) => {
  const { email } = req.body;
  console.log("email ->",email);
  try {
    const user = await plantTreeForm.findOne({ email: email });
    console.log("user ->", user);
    console.log("userId =>", user._id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    } else {
      // generating a token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });
      console.log("token =>", token);
      const randomLink = `https://kissantoken.io/setpassword?id=${user._id}&token=${token}`;
      await sendEmail(email, randomLink);
      res.status(200).json({
        message: "forgot password api hit successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(
      "error while calling forgot password api method",
      error.message
    );
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const resetPasswordApi = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  console.log("id,pswd ->",id,password);
  try {
    if (!password) {
      return res.status(401).json({
        message: "please provide a new password to reset ",
      });
    } else {
      const user = await plantTreeForm.findOne({ _id: id });
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      } else {
        const hashedNewPassword = await bcrypt.hash(password, 10);
        const hashedOldPassword = user.password;
        if (hashedNewPassword === hashedOldPassword) {
          return res.status(403).json({
            message: "Please set a new password",
          });
        } else {
          const updatedPassword = await plantTreeForm.findByIdAndUpdate(
            id,
            { password: hashedNewPassword },
            { new: true }
          );
          console.log("updatedPassword",updatedPassword);
          res.status(200).json({
            message: "password reset successfully",
            success: true,
            data: updatedPassword,
          });
        }
      }
    }
  } catch (error) {
    console.log("error while calling reset password api method", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};


export const handleUploadSelfie = async (req, res) => {
    try {
        const { email } = req.params;
        const {walletAddress ,location } = req.body;
        const { imageUrl } = req.file;

        // console.log("Received values ->>", email, location, imageUrl);

        // Check if the user exists
        let user = await plantTreeForm.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Generate a unique filename for the image
        const fileExtension = req.file.originalname.split('.').pop();
        const imageName = `${uuidv4()}.${fileExtension}`;
        const timestamp = new Date().toISOString();

        // Upload the file to S3 bucket
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `uploads/${timestamp}_${imageName}`,
            Body: req.file.buffer,
            ContentType: `image/${fileExtension}`,
        };

        const s3Result = await s3.upload(params).promise();

        // Construct new image location object
        const newImageLocation = {
            walletAddress:walletAddress,
            imageUrl: s3Result.Location,
            location: location,
            timestamp: timestamp
        };

        // Append the new image location to the user's imageLocations array
        user.imageLocations.push(newImageLocation);

        // Save the updated user document
        user = await user.save();

        // console.log("newDATA ->>", user);

        // Return success response
        res.status(200).json({
            message: "Selfie uploaded successfully",
            result: user
        });

    } catch (error) {
        console.error("Error while handling upload selfie:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export const getAllUsersList = async(req,res) => {
    try {
        const result = await plantTreeForm.find();
        // console.log("result ->>", result);
        if (!result) {
            return res.status(404).json({
                message: 'No list found'
            })
        } else {
            res.status(200).json({
                message: 'Users list fetched successfully',
                success: true,
                result: result
            })
        }
    } catch (error) {
        console.log("Error while fetching user data:", error);
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}

export const getUserDetailsByEmail = async(req,res) => {
    try{
const {email} = req.params;
const user = await plantTreeForm.findOne({email});
if(!user){
    res.status(404).json({
        message:"User not found"
    })
}else{
const result = user.imageLocations;
// console.log("result ->",result);
if(!result){
    res.status(404).json({
        message:"User's details not found"
    })
}else{
    res.status(200).json({
        message:"users's details fetched successfully",
        success:true,
        result:result
    })
}
}
    }catch(error){
        console.log("error while calling getUserDetailsByEmail method :",error.message);
        res.status(500).json({
            message:error.message
        })
    }
}

export const getAllUesrInfo = async (req, res) => {
    try {
        const result = await Form.find();
        // console.log("result ->>", result);
        if (!result) {
            return res.status(404).json({
                message: 'No list found'
            })
        } else {
            res.status(200).json({
                message: 'Users list fetched successfully',
                success: true,
                result: result
            })
        }
    } catch (error) {
        console.log("Error while fetching user data:", error);
        res.status(500).json({
            message: error.message,
            success: false,
        });
    }
}


export const getUserData = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userData = await Form.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get the S3 URL for the user's uploaded picture
    const s3FileUrl = userData.imageUrl;
    console.log("s3FileUrl", s3FileUrl);
  
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      userData: {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        walletAddress: userData.walletAddress,
        location: userData.location,
        imageUrl: s3FileUrl,
      },
    });
  } catch (error) {
    // console.log("Error while fetching user data:", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const fetchUserInfoByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const data = await Form.find({ email: email });
    console.log("data ->>", data);
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Email Not found",
      });
    } else {
      res.status(200).json({
        message: "UserData fetched successfully on basis of email",
        success: true,
        result: data,
      });
    }
  } catch (error) {
    // console.log(
    //   "error while calling fetchUserData By Email Address ->>",
    //   error
    // );
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const fetchUserInfoByImageName = async (req, res) => {
  try {
    const { imageUrl } = req.params;
    // console.log("ngdvsgh ->>", imageUrl);

    const urlToFetch = `https://kissan1.s3.amazonaws.com/uploads/${imageUrl}`;

    const allData = await Form.find();

    if (!allData) {
      return res.status(404).json({
        message: "No ImageUrl found",
      });
    } else {
      // console.log(urlToFetch);
      let responseUrl;
      let objData;

      const IMAGE = allData.map((url) => {
        if (decodeURIComponent(url.imageUrl) === urlToFetch) {
          // console.log("Found", url.imageUrl);
          responseUrl = url.imageUrl;
          objData = url;
        }
      });
      res.status(200).json({
        message: "image  url info fetched successfully",
        result: objData,
      });
    }
  } catch (error) {
    // console.log("Error while calling fetch info by image name ->>", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const deleteUserByIds = async (req, res) => {
  try {
    // console.log("start");
    const { ids } = req.body;
    // console.log("start ids ->>", ids);

    if (
      !ids ||
      !Array.isArray(ids) ||
      ids.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({ message: "Invalid or missing IDs" });
    }

    // Use the 'deleteMany' method to delete multiple documents by their IDs
    const result = await Form.deleteMany({ _id: { $in: ids } });

    // Check if any documents were deleted
    if (result.deletedCount > 0) {
      return res.json({ message: "Rows deleted successfully" });
    } else {
      return res.status(404).json({ error: "No matching rows found" });
    }
  } catch (error) {
    // console.log("Error while calling deleteUserByIds method:", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

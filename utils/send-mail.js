import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

//  Configuring email service provider here
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.USER_PASS,
  },
});

// creating a function to send email here
export const sendEmail = async (email, randomLink) => {
  const mailOptions = {
    from: process.env.USER_NAME,
    to: email,
    subject: "Verify Your Account",
    text: `Click on the following link to verify your Account:    ${randomLink}`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}: ${info.response}`);
  } catch (error) {
    console.log("error while sending mail", error.message);
  }
};

export const sendOtp = async (newEmail, otp) => {
  const mailOptions = {
    from: "mine-address",
    to: newEmail,
    subject: "OTP for Email Change",
    text: `Your OTP for email change is: ${otp}`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification otp sent to ${email}: ${info.response}`);
  } catch (error) {
    console.log("error while sending mail", error.message);
  }
};

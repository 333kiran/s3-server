
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
export const sendNewsletterEmail = async (email, subject,text) => {
    const mailOptions = {
      from: process.env.USER_NAME,
      to: email,
      subject: subject,
      text: text,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}: ${info.response}`);
    } catch (error) {
      console.log("error while sending mail", error.message);
    }
  };
  
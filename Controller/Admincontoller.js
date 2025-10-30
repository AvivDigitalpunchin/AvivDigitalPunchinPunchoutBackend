import CourseDB from "../Model/CourseModel.js";
import MentorDB from "../Model/MentorModel.js";
import OtpDB from "../Model/OtpModel.js";
import StudentDB from "../Model/Studentsmodel.js";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import jwt from "jsonwebtoken";

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET||"key123";


const admin={
    email:"admin@gmail.com",
    password:"admin123"
}

const adminlogin = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check credentials
    if (email === admin.email && password === admin.password) {
      // Generate JWT
      const token = jwt.sign(
        { email: admin.email, role: "admin" }, // payload
        JWT_SECRET, 
        { expiresIn: "10m" } // token expiry
      );

      return res.status(200).json({
        message: "Login successful",
        token, // send token
        role: "admin"
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const courses = async (req, res) => {
  try {
    const data = await CourseDB.find();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// controllers/courseController.js

const addCourse = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }

    const newCourse = new CourseDB({ title });
    const savedCourse = await newCourse.save();

    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

 const toggleCourseActive = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Course ID is required' });

    const course = await CourseDB.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.active = !course.active;
    await course.save();

    res.status(200).json(course);
  } catch (error) {
    console.error('Toggle course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addbatch= async(req,res)=>{
  try {
    const { courseId, batchName } = req.body;

    if (!courseId || !batchName) {
      return res.status(400).json({ message: 'Course ID and Batch Name are required' });
    }

    const course = await CourseDB.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Add batch (as string or as object depending on your schema)
    course.batches.push({ name: batchName });
    await course.save();

    res.status(200).json(course);
  } catch (error) {
    console.error('Error adding batch:', error);
    res.status(500).json({ message: 'Server error' });
  }

}


const getCounts = async (req, res) => {
  try {
    
    const studentCount = await StudentDB.countDocuments({ active: true });
    const mentorCount = await MentorDB.countDocuments({ active: true });

    
    

    res.json({ studentCount, mentorCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching counts' });
  }
};




const sendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    

    // save OTP in DB (replace old OTP if exists)
    await OtpDB.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // send mail
    await transporter.sendMail({
      from: `"Mentor App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      text: `Your verification code is: ${otp}`,
      html: `<h3>Your verification code is:</h3> <b>${otp}</b>`,
    });

    res.json({ success: true, message: "Verification email sent ✅" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP required" });
  }

  try {
    const record = await OtpDB.findOne({ email });

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not found ❌" });
    }

    if (record.otp === otp) {
      await OtpDB.deleteOne({ email }); // remove after success
      return res.json({ success: true, message: "Email verified successfully ✅" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP ❌" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export {
    adminlogin,
    courses,
    addCourse,
    toggleCourseActive,
    addbatch,
    getCounts,
    sendVerificationEmail,
    verifyOtp
}
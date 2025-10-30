import MentorDB from "../Model/MentorModel.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import CourseDB from "../Model/CourseModel.js";
import StudentDB from "../Model/Studentsmodel.js";


dotenv.config()

const mentorlist = async (req, res) => {
  try {
    const data = await MentorDB.find().select("-password -__v"); // exclude password and __v
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const addMentor = async (req, res) => {
  try {
    const { name, email, phone, course, password, active } = req.body;

    // Simple validation
    if (!name || !email || !phone || !course || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newMentor = new MentorDB({
      name,
      email,
      phone,
      course,
      password: hashedPassword, // store hashed password
      active: active ?? true,   // default true if not provided
    });

    const savedMentor = await newMentor.save();

    // prevent returning hashed password in response
    const { password: _, ...mentorWithoutPassword } = savedMentor.toObject();

    res.status(201).json(mentorWithoutPassword);
  } catch (error) {
    console.error('Error adding mentor:', error);
    res.status(500).json({ message: 'Server error while adding mentor' });
  }
};
const toggleMentorStatus = async (req, res) => {
  try {
    const { id } = req.body;

    const mentor = await MentorDB.findById(id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.active = !mentor.active;
    await mentor.save();

    res.status(200).json({ message: 'Mentor status toggled', data: mentor });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling mentor status', error: err.message });
  }
};


const updateMentor = async (req, res) => {
  try {
    const {_id, name, email, phone, course } = req.body;
    

    const updatedMentor = await MentorDB.findByIdAndUpdate(
      _id,
      { name, email, phone, course },
      { new: true }
    );

    if (!updatedMentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json({ message: "Mentor updated successfully", data: updatedMentor });
  } catch (error) {
    res.status(500).json({ message: "Error updating mentor", error: error.message });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "key123"; // use env var in production

const mentorLogin = async (req, res) => {
  try {
    console.log("sgdj");
    
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find mentor by email
    console.log(password);
    
    const mentor = await MentorDB.findOne({ email });
    if (!mentor) {
      return res.status(400).json({ message: "Mentor not found" });
    }

// Compare hashed password
    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: mentor._id, email: mentor.email, role: "mentor" }, // payload
      JWT_SECRET,
      { expiresIn: "2h" } // token expiry time
    );
    console.log(token);
    
    // Respond with success
    res.status(200).json({
      message: "Login successful",
      token,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        role: "mentor",
      },
    });
  } catch (error) {
    console.error("Mentor login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const batchlist = async (req, res) => {
  try {
    // Ensure user info exists from verified token
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized access. No user found." });
    }

    // Find mentor by email
    const mentor = await MentorDB.findOne({ email });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    // Find course assigned to mentor
    const course = await CourseDB.findOne({ title: mentor.course });
    if (!course) {
      return res.status(404).json({ message: "Assigned course not found." });
    }

    // Check if course has batches
    if (!course.batches || course.batches.length === 0) {
      return res.status(200).json({ message: "No batches found for this course.", batches: [] });
    }

    // Respond with batch list
    return res.status(200).json({
      message: "Batch list fetched successfully.",
      batches: course.batches,
    });
  } catch (error) {
    console.error("Error fetching batch list:", error);
    return res.status(500).json({
      message: "Server error while fetching batch list.",
    });
  }
};


const mentordetails = async (req, res) => {
  try {
    // Ensure authenticated user
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({ message: "Unauthorized access. No user found." });
    }

    // Find mentor by email and exclude password
    const mentor = await MentorDB.findOne({ email }).select("-password");
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found." });
    }

    // Respond with mentor details
    return res.status(200).json({
      message: "Mentor details fetched successfully.",
      mentor,
    });
  } catch (error) {
    console.error("Error fetching mentor details:", error);
    return res.status(500).json({
      message: "Server error while fetching mentor details.",
    });
  }
};


const batchStudents = async (req, res) => {
  try {
    const { batchName } = req.body; // match frontend key
    const students = await StudentDB.find({ batch: batchName });

    res.json({ students }); // use proper key name
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error fetching students" });
  }
};


export {
    mentorlist,
    addMentor,
    toggleMentorStatus,
    updateMentor,
    mentorLogin,
    batchlist,
    mentordetails,
    batchStudents
}
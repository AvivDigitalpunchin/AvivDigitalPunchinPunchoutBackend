import StudentDB from "../Model/Studentsmodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import PunchInDB from "../Model/PunchinModel.js";
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";


// GET all students
const getAllStudents = async (req, res) => {
  try {
    const students = await StudentDB.find();
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
};

const addStudent = async (req, res) => { 
  try {
    const { name, email, phone, course, batch, password, active } = req.body;

    // Hash password before saving
    const salt = await bcrypt.genSalt(10); // 10 rounds of salting
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = new StudentDB({
      name,
      email,
      phone,
      course,
      batch,
      password: hashedPassword, // store hashed password
      active,
    });

    await newStudent.save();

    res.status(201).json(newStudent);
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(400).json({ success: false, message: "Failed to add student" });
  }
};


// EDIT student
const editStudent = async (req, res) => {
  try {
    const { _id, name, email, phone, course, batch } = req.body;
    const updated = await StudentDB.findByIdAndUpdate(
      _id,
      { name, email, phone, course, batch },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to edit student" });
  }
};

// TOGGLE active/inactive status
const toggleStudentStatus = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);
    
    const student = await StudentDB.findById(id);
    
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    student.active = !student.active;
    
    await StudentDB.updateOne({_id:id},{active:student.active});
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, mess_age: "Failed to toggle status" });
  }
};


const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const student = await StudentDB.findOne({ email });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }
const isMatch = await bcrypt.compare(password, student.password);

if (!isMatch) {
  return res
    .status(401)
    .json({ success: false, message: "Incorrect password." });
}

    // Generate JWT
    const token = jwt.sign(
      { id: student._id, email: student.email, role: "student" }, // payload
      JWT_SECRET,
      { expiresIn: "1h" } // adjust expiry as needed
    );

    // Respond with token and student data
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: "student",
      data: student,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
};

const details = async (req, res) => {
  try {
    // Ensure user info is available from your token middleware
    const email = req.user.email;

    // Find student by email (exclude password)
    const student = await StudentDB.findOne({ email }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Send a clean response for frontend
    res.status(200).json({
      name: student.name,
      email: student.email,
      phone: student.phone || "Not provided",
      course: student.course || "Not provided",
      batch: student.batch || "Not assigned",
      active: student.active,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Server error while fetching student details" });
  }
};

const punchin=async(req, res) => {
  try {
    const email = req.user.email;
    const { lat, lng } = req.body;

    let studentPunch = await PunchInDB.findOne({ email });
    if (!studentPunch) {
      studentPunch = new PunchInDB({ email, punches: [] });
    }

    // If last punch is punch in, don't allow another punch in
    const lastPunch = studentPunch.punches[studentPunch.punches.length - 1];
    if (lastPunch && !lastPunch.punchOutTime) {
      return res.status(400).json({ message: "Already punched in" });
    }

    const newPunch = {
      punchInTime: new Date(),
      locationIn: { lat, lng },
    };

    studentPunch.punches.push(newPunch);
    studentPunch.lastPunchStatus = true; // last punch is punch-in
    await studentPunch.save();

    res.status(200).json({ message: "Punch in recorded", punch: newPunch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const punchout = async (req, res) => {
  try {
    const email = req.user.email;
    const { lat, lng } = req.body;

    const studentPunch = await PunchInDB.findOne({ email });
    if (!studentPunch) return res.status(404).json({ message: "No punches found" });

    const lastPunch = studentPunch.punches[studentPunch.punches.length - 1];
    if (!lastPunch || lastPunch.punchOutTime) {
      return res.status(400).json({ message: "No active punch-in found" });
    }

    lastPunch.punchOutTime = new Date();
    lastPunch.locationOut = { lat, lng };
    studentPunch.lastPunchStatus = false; // last punch is now punch-out

    await studentPunch.save();

    res.status(200).json({ message: "Punch out recorded", punch: lastPunch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const punchindetails = async (req, res) => {
  try {
    const email = req.user.email; // assuming JWT middleware sets req.user
    let record = await PunchInDB.findOne({ email });

    if (!record) {
      return res.json({
        punches: [],
        latestPunch: null,
        lastPunchStatus: false,
      });
    }

    // Get last punch
    const lastPunch = record.punches[record.punches.length - 1];

    if (lastPunch && lastPunch.punchInTime && !lastPunch.punchOutTime) {
      const punchInDate = new Date(lastPunch.punchInTime);
      const now = new Date();

      // 🕛 If the last punch-in was on a previous date (different day)
      const isDifferentDay =
        punchInDate.toDateString() !== now.toDateString();

      if (isDifferentDay) {
        // Set auto punch-out at 11:59:59 PM of that punch-in date
        const autoOut = new Date(punchInDate);
        autoOut.setHours(23, 59, 59, 999);

        lastPunch.punchOutTime = autoOut;
        record.lastPunchStatus = false; // no longer punched in

        await record.save();
        console.log(`✅ Auto punch-out applied for ${email} at ${autoOut}`);
      }
    }

    // Re-fetch updated record
    record = await PunchInDB.findOne({ email });

    const latestPunch = record.punches[record.punches.length - 1];

    res.json({
      punches: record.punches,
      latestPunch,
      lastPunchStatus:
        latestPunch && !latestPunch.punchOutTime ? true : false,
    });
  } catch (err) {
    console.error("Error fetching punch details:", err);
    res.status(500).json({ message: "Error fetching punch details" });
  }
};

export{
    getAllStudents,
    addStudent,
    editStudent,
    toggleStudentStatus,
    studentLogin,
    details,
    punchin,
    punchout,
    punchindetails
}

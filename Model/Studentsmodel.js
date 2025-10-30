// models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  course: String,
  batch: String,
  password: {
    type: String,
    required: true, // Make it required if every student must have a password
  },
  active: { type: Boolean, default: true },
});

const StudentDB = mongoose.model("Student", studentSchema);

export default StudentDB;

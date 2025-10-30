// models/Mentor.js
import mongoose from 'mongoose';

const MentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MentorDB = mongoose.model('Mentor', MentorSchema);

export default MentorDB;

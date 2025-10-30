// models/Course.js

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  batches: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const CourseDB = mongoose.model('Course', courseSchema);

export default CourseDB;

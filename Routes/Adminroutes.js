import express from 'express'
import { addbatch, addCourse, adminlogin, courses, getCounts, sendVerificationEmail, toggleCourseActive, verifyOtp } from '../Controller/Admincontoller.js';
import { verifyToken } from '../Middleware/Auth.js';
const router = express.Router()

router.get('/courses', verifyToken,courses)
router.get("/dashboard/counts", verifyToken ,getCounts)

router.post("/adminlogin",adminlogin)
router.post('/addcourse', verifyToken,addCourse)
router.post('/courses/toggle', verifyToken,toggleCourseActive)
router.post('/courses/add-batch, verifyToken',addbatch)
router.post("/mentor/send-verification", verifyToken, sendVerificationEmail);
router.post("/mentor/verify-otp", verifyToken, verifyOtp);    



export default router; 
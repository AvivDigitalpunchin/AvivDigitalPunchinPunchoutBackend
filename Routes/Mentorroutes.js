import express from 'express'
import { addMentor, batchlist, batchStudents,  mentordetails, mentorlist, mentorLogin, toggleMentorStatus, updateMentor } from '../Controller/Mentorcontroller.js'; 
import { verifyToken } from '../Middleware/Auth.js';
const router = express()


router.get("/mentors", verifyToken,mentorlist)
router.post("/addmentor", verifyToken,addMentor)
router.post("/toggle", verifyToken,toggleMentorStatus) 
router.post("/update", verifyToken,updateMentor)
router.post("/mentorlogin",mentorLogin) 
router.get("/batchlist", verifyToken,batchlist)
router.get("/datails", verifyToken,mentordetails)
router.post("/batch/students", verifyToken,batchStudents)





export default router; 
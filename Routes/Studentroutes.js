import express from "express";
import { addStudent, details, editStudent, getAllStudents, punchin, punchindetails, punchout, studentLogin, toggleStudentStatus } from "../Controller/Studentcontroller.js";
import { verifyToken } from "../Middleware/Auth.js";

const router = express.Router();

router.get("/all", verifyToken, getAllStudents);
router.post("/add", verifyToken, addStudent);
router.post("/edit", verifyToken, editStudent);
router.post("/toggle", verifyToken, toggleStudentStatus);
router.post("/studentlogin",studentLogin)
router.post("/punchin",  verifyToken,punchin)
router.get("/details",verifyToken,details)
router.get("/punchindetails",verifyToken,punchindetails)
router.post("/punchout",verifyToken,punchout)
export default router;
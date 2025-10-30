import express from 'express'
import dotenv from 'dotenv'
import connectDb from './Database/Connection.js'
import cors from 'cors'
import Adminroutes from './Routes/Adminroutes.js'
import Mentorroutes from './Routes/Mentorroutes.js'
import Studentroutes from './Routes/Studentroutes.js'

const app= express()


dotenv.config()


const PORT = 4001;


connectDb()
 
// const corsOptions = {
//     origin: ['http://localhost:5173/','http://localhost:5173','http://localhost:5174/','http://localhost:5174'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// };
const corsOptions = {
    origin: ['https://avivpunchinpunchout-1.onrender.com/','https://avivpunchinpunchout-1.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));






app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use('/admin',Adminroutes)
app.use('/mentor',Mentorroutes)
app.use('/student',Studentroutes)

app.get("/adminlogin",(req,res)=>{
    res.send("its done")
})




app.listen(PORT,()=>{
    console.log(`server is running successfully in PORT : ${PORT}`);
    
})
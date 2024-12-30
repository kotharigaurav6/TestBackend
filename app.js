import express from 'express';
import adminRouter from './router/adminRouter.js';
import candidateRouter from './router/candidateRouter.js';
import recruiterRouter from './router/recruiterRouter.js';
import cookieParser from 'cookie-parser';
import vacancyRouter from './router/vacancyRouter.js';
import expressFileUpload from 'express-fileupload';
import appliedVacancyRouter from './router/appliedVacancyRouter.js';
import cors from 'cors';

var app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'));
app.use(expressFileUpload());
app.use(cookieParser());
app.set("views","views");
app.set("view engine","ejs");

app.get("/",(request,response)=>{
    response.render("home.ejs");
});
app.use("/admin",adminRouter);
app.use("/recruiter",recruiterRouter);
app.use("/candidate",candidateRouter);
app.use("/vacancy",vacancyRouter);
app.use("/appliedVacancy",appliedVacancyRouter);

app.listen(3001,()=>{
    console.log("Connection established successfully");
})
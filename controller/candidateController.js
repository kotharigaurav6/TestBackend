import mailer from "../router/mailer.js"
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';
import candidateSchema from "../model/candidateSchema.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import vacancySchema from "../model/vacancySchema.js";
import appliedVacancySchema from "../model/appliedVacancySchema.js";

dotenv.config();
var candidate_secret_key = process.env.CANDIDATE_SECRET_KEY;

export const candidateRegistrationController = async (request, response) => {
    try {
        console.log("candidate file data : ",request.files);
        
        const __filename = fileURLToPath(import.meta.url);
        //console.log("__filename : ",__filename);
        const __dirname = path.dirname(__filename).replace("\\controller", "");
        //console.log("__dirname : ",__dirname);
        //console.log("request.files : ",request.files);
        const filename = request.files.docs;
        const fileName = new Date().getTime() + filename.name;
        const pathName = path.join(__dirname, "/public/documents/", fileName);
        //console.log("pathName : ",pathName);

        filename.mv(pathName, async (error) => {
            if (error) {
                console.log("Error occured while uploading file");
            } else {
                console.log("File uploaded successfully");
                const { name, _id, password, gender, dob, address, contact, qualification, percentage, experience } = request.body;
                const obj = {
                    name: name,
                    _id: _id,
                    password: await bcrypt.hash(password, 10),
                    gender: gender,
                    dob: dob,
                    address: address,
                    contact: contact,
                    qualification: qualification,
                    percentage: percentage,
                    experience: experience,
                    docs:fileName
                }
                const mailContent = `Hello ${_id},<br>This is a verification mail by Faculty Recruitment System. You Needs to verify yourself by clicking on the below link.<br><a href='http://localhost:3000/candidate/verifyEmail?email=${_id}'>Click Here To Verify</a>`;

                mailer.mailer(mailContent, _id, async (info) => {
                    if (info) {
                        const result = await candidateSchema.create(obj);
                        console.log("Result of candidate registration : ", result);
                        response.render("candidateLogin", { message: "Email Sent | Please Verify" });

                    } else {
                        console.log("Error while sending email");
                        response.render("candidateRegistration", { message: "Error while sending email" });
                    }
                })
            }
        });

    } catch (error) {
        console.log("Error occured in candidate registration uploading file : ", error);
        // response.render("recruiterRegistration.ejs",{message : "Error occured in recruiter registration"});
    }
}

export const candidateVerifyEmailController = async(request,response)=>{
    const email = request.query.email;
    const updateStatus = {$set:{emailVerify:"Verified"}};
    const updateResult = await candidateSchema.updateOne({_id:email},updateStatus);
    console.log("Update Result : ",updateResult);
    response.render("candidateLogin",{message:"Email Verified | Admin verification takes 24 Hours"});
}

export const candidateLoginController = async(request,response)=>{
    try{
         console.log("gets entry in candidate login controller");
            
         const candidateObj = await candidateSchema.findOne({_id:request.body.email});
         //console.log("-------------> ",candidateObj);
         if(candidateObj==null)
                throw new Error("Candidate not exist");   
         
         const candidatePassword = candidateObj.password;
         const candidateStatus = candidateObj.status;
         console.log("candidateStatus : ",candidateStatus);
         console.log("typeof candidateStatus : ",typeof candidateStatus);
         
         const adminVerifyStatus = candidateObj.adminVerify;
         const emailVerifyStatus = candidateObj.emailVerify;
         
         const status = await bcrypt.compare(request.body.password,candidatePassword);
         if(status && candidateStatus && adminVerifyStatus=="Verified" && emailVerifyStatus == "Verified"){
            const expireTime = {expiresIn:'1d'};
            const token = jwt.sign({email:request.body.email},candidate_secret_key,expireTime);
            console.log("Token : ",token);
            
            if(!token)
                //response.render("candidateLogin",{message:"Error while setting up the token while candidate login"});
                response.status(203).send({status:false,message:"Error while setting up the token while candidate login"});

            //response.cookie('candidate_jwt_token',token,{maxAge:24*60*60*1000,httpOnly:true});
            //response.render("candidateHome",{email:request.body.email});
            response.status(200).send({status:true,email:request.body.email,token:token}); 
        }     
        else
            // response.render("candidateLogin",{message:"Password is Wrong"}); 
            response.status(203).send({status:false,message:"Password is Wrong"});
    }catch(error){
        console.log("Error in candidateLogin : ",error);
        //response.render("candidateLogin",{message:"Something Went Wrong"}); 
        response.status(500).send({status:false,message:"Something Went Wrong"});
    }
}

export const candidateLogoutController = async(request,response)=>{
    console.log(response);
    response.clearCookie('candidate_jwt_token');
    response.render("candidateLogin",{message:"Candidate Logout Successfully"});    
}

export const candidateVacancyListController = async(request,response)=>{
    try{
        const vacancyList = await vacancySchema.find();
        console.log("vacancyList : ",vacancyList);
        if(vacancyList.length==0){
            //response.render("candidateVacancyList",{email:request.payload.email,vacancyList:vacancyList,message:"No Record Found",status:[]});
            response.status(200).send({status:true,email:request.payload.email,vacancyList:vacancyList,message:"No Record Found",vacancyStatus:[]});
        }else{
            const candidateVacancyRecord = await appliedVacancySchema.find({candidateEmail:request.payload.email});
            
            //console.log(candidateVacancyRecord);
            if(candidateVacancyRecord.length==0){
                //response.render("candidateVacancyList",{email:request.payload.email,vacancyList:vacancyList,message:"",status:[]});
                response.status(200).send({status:true,email:request.payload.email,vacancyList:vacancyList,message:"",vacancyStatus:[]});
            }else{
                console.log(candidateVacancyRecord);
                //response.render("candidateVacancyList",{email:request.payload.email,vacancyList:vacancyList,message:"",status:candidateVacancyRecord});
                response.status(200).send({status:true,email:request.payload.email,vacancyList:vacancyList,message:"",vacancyStatus:candidateVacancyRecord});
            }
            
        }
    }catch(error){
        console.log("Error : ",error);
        const vacancyList = await vacancySchema.find();
        //response.render("candidateVacancyList",{email:request.payload.email,vacancyList:vacancyList,message:"Wait Data is Loading",status:false});
        response.status(500).send({status:false,email:request.payload.email,vacancyList:vacancyList,message:"Wait Data is Loading",vacancyStatus:false});
    }
}

export const myStatusController = async(request,response)=>{
    try{
        const appliedVacancyList = await appliedVacancySchema.find({candidateEmail:request.payload.email});
        //console.log("Applied VacancyList : ",appliedVacancyList);
        if(appliedVacancyList.length==0){
            //response.render("myStatusList",{email:request.payload.email,appliedVacancyList:appliedVacancyList,message:"No Record Found"});
            response.status(200).send({status:true,email:request.payload.email,appliedVacancyList:appliedVacancyList,message:"No Record Found"});
        }else{
            //response.render("myStatusList",{email:request.payload.email,appliedVacancyList:appliedVacancyList,message:""});
            response.status(200).send({status:true,email:request.payload.email,appliedVacancyList:appliedVacancyList,message:""});
        }
    }catch(error){
        console.log("Error in myStatusController : ",error);
        const appliedVacancyList = await appliedVacancySchema.find({candidateEmail:request.payload.email});
        //response.render("myStatusList",{email:request.payload.email,appliedVacancyList:appliedVacancyList,message:"Wait Data is Loading"});
        response.status(500).send({status:false,email:request.payload.email,appliedVacancyList:appliedVacancyList,message:"Wait Data is Loading"});
    }
}
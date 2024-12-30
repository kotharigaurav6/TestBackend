import express from 'express';
import { candidateRegistrationController,candidateVerifyEmailController,candidateLoginController,candidateLogoutController,candidateVacancyListController,myStatusController } from '../controller/candidateController.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const candidate_secret_key = process.env.CANDIDATE_SECRET_KEY;

var candidateRouter = express.Router();

candidateRouter.use(express.static('public'));
let authenticateJWT = (request,response,next)=>{
    //console.log("gets entry");
    // const token = request.cookies.candidate_jwt_token;
    const token = request.query.candidateToken;
    //console.log("token : ",token);
    try{  
        jwt.verify(token,candidate_secret_key,(error,payload)=>{
            if(error){
                response.render("candidateLogin",{message:"Please Login First"});
            }else{
                request.payload=payload;
                next();
            }
        });
    }catch(error){
        response.render("candidateLogin",{message:"Something went wrong in JWT"});
    }
}

candidateRouter.get("/candidateLogin",(request,response)=>{
    response.render("candidateLogin.ejs",{message:""});
});
candidateRouter.get("/candidateLogout",candidateLogoutController);

candidateRouter.get("/candidateRegistration",(request,response)=>{
    response.render("candidateRegistration.ejs");
});
candidateRouter.post("/candidateRegistration",candidateRegistrationController);
candidateRouter.get("/verifyEmail",candidateVerifyEmailController);
candidateRouter.post("/candidateLogin",candidateLoginController);

candidateRouter.get("/candidateHome",authenticateJWT,(request,response)=>{
    response.render("candidateHome.ejs",{email:request.payload.email});
});

candidateRouter.get("/vacancyList",authenticateJWT,candidateVacancyListController);
candidateRouter.get("/myStatus",authenticateJWT,myStatusController);

export default candidateRouter;
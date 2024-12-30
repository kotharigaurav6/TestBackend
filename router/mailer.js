import nodemailer from 'nodemailer';

var mailer = function(mailContent,email,callback){
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'onlinespareparts2019@gmail.com',
            pass:'vdbzzfpagidqntma'
        }
    });    
    const mailOption = {
        from : 'onlinespareparts2019@gmail.com',
        to : email,
        subject :"Verification Mail by Express Community",
        html: mailContent
    }
    transporter.sendMail(mailOption,(error,info)=>{
        if(error)
            console.log("Error while sending mail inside sendMail");
        else{
            console.log("Mail sent from sendMail");
            callback(info);
        }            
    });
};
export default {mailer:mailer};
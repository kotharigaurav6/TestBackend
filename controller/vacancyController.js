import recruiterSchema from "../model/recruiterSchema.js";
import vacancySchema from "../model/vacancySchema.js";
import uuid4 from "uuid4";

export const recruiterAddVacancyController = async (request, response) => {
    try {
        // Generate a new UUID
        const vacancyId = uuid4();
        const vacancyObj = request.body;
        vacancyObj.vacancyId = vacancyId;
        // console.log("--------vacancyObj-----------> : ",vacancyObj);
        const recruiterObj = await recruiterSchema.findOne({ email: request.payload.email });
        // console.log("---------recruiterObj----------> ",recruiterObj);
        vacancyObj.email = recruiterObj.email;
        vacancyObj.recruiter = recruiterObj.recruiter;
        vacancyObj.name = recruiterObj.name;
        // console.log("-----After Adding---vacancyObj-----------> : ",vacancyObj);

        const result = await vacancySchema.create(vacancyObj);        
        //console.log(result);
        if(result){
            // response.render("addVacancy",{email:request.payload.email,recruiterObj: recruiterObj,message:"Vacancy Added Successfully"});
            response.status(200).send({email:request.payload.email,recruiterObj: recruiterObj,message:"Vacancy Added Successfully"});
        }else{
            // response.render("addVacancy",{email:request.payload.email,recruiterObj: recruiterObj,message:"Error while adding vacancy"});
            response.status(203).send({email:request.payload.email,recruiterObj: recruiterObj,message:"Error while adding vacancy"});
        }
        
    } catch (error) {
        console.log("Error while recruiterAddVacancy : ", error);
        const recruiterObj = await recruiterSchema.findOne({ email: request.payload.email });
        //console.log("recruiterObj : ", recruiterObj);
        //response.render("addVacancy.ejs", { email: request.payload.email, recruiterObj: recruiterObj,message:"Error while Adding Vacancy" });
        response.status(500).send({ email: request.payload.email, recruiterObj: recruiterObj,message:"Error while Adding Vacancy" });
    }
}


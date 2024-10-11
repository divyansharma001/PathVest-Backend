const {Router}=require("express");
const adminRouter=Router();

const {userModel, courseModel, instructorModel, purchasesModel,courseContentModel,lessonModel,sectionModel}=require("../database/databaseIndex")

const {adminAuthentication}=require("../middlewares/adminmiddleware")

adminRouter.post("/singup",async (req,res)=>{

})
adminRouter.post("/login",async (req,res)=>{

})

adminRouter.use(adminAuthentication)
    
adminRouter.post("/course",(req,res)=>{

})

adminRouter.put("/course",(req,res)=>{

})

adminRouter.delete("/delete/:id",(req,res)=>{

})


module.exports = {
    adminRouter: adminRouter
}
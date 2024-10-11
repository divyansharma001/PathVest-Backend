const express=require("express");
const userRouter=express.Router();

const {userModel, savingsModel}=require("../database/databaseIndex")

const bcrypt=require("bcrypt");
const saltingRounds=10;

const env=require("dotenv");
env.config();

const jwt=require("jsonwebtoken");
const Secret_Key=process.env.Secret_Key;

const z=require("zod")

// const {userAuthentication} = require("../middlewares/usermiddleware")

//basically the req body will look like this: {name, email, password, age, risk, monthlyIncome, insurences: ["ksdjnc","dscjkn","sdc"], estimatedExpenses, savingorInvestement: {mutualFunds: {"ds":"sc"},virtualGold: 12, equity: {"dewwe":"23"}}}

userRouter.post('/signup',async (req, res) => {

    let signupValidData= z.object({
        email: z.string().email()
        .min(3,"Username must be at least 3 characters long")
        .max(30,"Username must not exceed 30 characters"),
        name: z.string()
        .min(2,"Name must be at least 2 characters long")
        .max(50,"Name must not exceed 50 characters")
        .regex(/^[a-zA-Z\s\-]+$/, "Name can only contain letters, spaces, and hyphens"),
        password: z.string()
        .min(8,"Password must be at least 8 characters long")
        .max(30, "Password must not exceed 30 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/, 
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        age: z.number().int(),
        risk: z.number(),
        monthlyIncome: z.number().min(0, "Monthly income must be positive"),
        insurances: z.array(z.string()),
        estimatedExpenses: z.number().min(0, "Estimated expenses must be positive"),
        savingorInvestement: z.object({
            mutualFunds: z.record(z.string(), z.string()).optional(), 
            virtualGold: z.number().min(0, "Virtual gold value must be non-negative").optional(),
            equity: z.record(z.string(), z.string()).optional(), 
        })
    })
    //can add more vaildations here

    let validateData=signupValidData.safeParse(req.body);

    if(validateData.success){

        let email=req.body.email;
        let password=req.body.password;
        
        try{
            hashedPassword=await bcrypt.hash(password,saltingRounds)
            newUser=await userModel.create({
                email,
                name: req.body.name,
                password: hashedPassword,
                age: req.body.age,
                risk: req.body.risk,
                monthlyIncome: req.body.monthlyIncome,
                insurences: req.body.insurences,
                estimatedExpenses: req.body.estimatedExpenses
                // profileImg: profilePictures[Math.floor(Math.random()*profilePictures.length)]
            })
            newSavings=await savingsModel.create({
                userId: newUser._id,
                equity: req.body.savingorInvestement.equity,
                mutualFunds: req.body.savingorInvestement.mutualFunds,
                virtualGold: req.body.savingorInvestement.virtualGold,
            })
        
        }
        catch(error){
            if(error.code===11000){
                res.status(500).json({ 
                    message: "User with this email already exist!!"
                });
                return
            }
            res.status(500).json({ 
                message: "There was an error while creating the Account.", 
                error: error
            });
            return;
        }

        token=jwt.sign({ 
            email,
            userId: newUser._id
        },Secret_Key); 

        res.status(200).json({
            message: `Signup Complete, for ${newUser.name}!!!`,
            token: token,
            email
            // profileImg: newUser.profileImg,
        });
        return;
    }
    else{
        res.status(401).json({
            message: validateData.error.issues[0].message,
            description: validateData.error.issues[0].path
        });
        return;
    }    
});
     

userRouter.post("/login",async (req,res)=>{

    let loginValidData=z.object({
        email: z.string().email()
        .min(3,"Email must be at least 3 characters long"),

        password: z.string()
        .min(8,"Password must be at least 8 characters long")
        .max(30, "Password must not exceed 30 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/, 
   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })

    let validateData=loginValidData.safeParse(req.body)

    if(validateData.success){
        let email=req.body.email;
        let password=req.body.password;

        let userFound=await userModel.findOne({email});
        let passwordMatch=false;
        try{
            passwordMatch=await bcrypt.compare(password,userFound.password);
        }
        catch(e){
            res.status(401).json({
                message: `LogIn Failed!!!! ${userFound?'There was an error while verifying password.':'User doesn\'t exist! SignUp first'}`,
            })
            return;
        }
        if(userFound&&passwordMatch){
            
            token=jwt.sign({ 
                email,
                userId: userFound._id
            },Secret_Key); 

            res.json({
                message: `Hey ${userFound.name}!, you are Logged In!!!!`,
                token: token,
                email: userFound.email
            });
            return;
        }
        else{
            res.status(401).json({
                message: `LogIn Failed!!!! ${userFound?'Password is Incorrect':'User doesn\'t exist! SignUp first'}`,
                status: userFound?'Password is Incorrect':'User doesn\'t exist!'
            })
            return;
        }
    }
    else{
        res.status(401).json({
            message: validateData.error.issues[0].message,
            description: validateData.error.issues[0].path
        })
        return;
    }
});


module.exports= {
    userRouter
}

//i have to do two things, first create users schema and add the survey form data in the signup and store it in db
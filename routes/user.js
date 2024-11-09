const express=require("express");
const userRouter=express.Router();

const {userModel, savingsModel, expenseModel }=require("../database/databaseIndex")

const bcrypt=require("bcrypt");
const saltingRounds=10;

const env=require("dotenv");
env.config();

const jwt=require("jsonwebtoken");
const Secret_Key=process.env.Secret_Key;

const z=require("zod")

const {userAuthentication} = require("../middlewares/usermiddleware")

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
            userId: newUser._id
        },Secret_Key); 

        res.status(200).json({
            message: `Signup Complete, for ${newUser.name}!!!`,
            token: token
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
                userId: userFound._id
            },Secret_Key); 

            res.json({
                message: `Hey ${userFound.name}!, you are Logged In!!!!`,
                token: token
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
//create a registration endpoint , that takes in the survey form data, same as it was taken in the signup ep and stores it in the db    
userRouter.post("/register",userAuthentication,async (req,res)=>{
    // let userId=req.userId;
    let userId=req.body.email;
    // console.log(userId);
    
    let user=await userModel.findOne({email: userId});
    
    
    if(user){
        let userSurveyData=req.body;

        try{
            let surveyData=await userModel.updateOne({email: userId},userSurveyData);
            res.json({
                message: "User Survey Data Added Successfully",
                data: surveyData
            })
        }
        catch(e){
            res.status(500).json({
                message: "Error while adding user survey data",
                error: e
            })
        }
    }
    else{
        res.status(401).json({
            message: "User doesn't exist"
        })
    }
})


userRouter.get("/",userAuthentication,async (req,res)=>{//if the control is reaching then most prolly the user exists except for
    // the case when user deletes his acc
    try{
        let userId=req.userId;
        let user=await userModel.findById(userId);
        let usersavingorInvestement=await savingsModel.find({
            userId
        });

        if(user){
            let responseData=Object.assign(user, usersavingorInvestement)
            responseData["password"]=undefined
            responseData['__v']=undefined
            res.json({
                message: "Data Fetched Successfully",
                data: responseData
            })
        }
    }
    catch(e){
        console.log(e);       
        res.status(500).json({
            message: "Error while fetching data",
            error: e
        })
    }
})
userRouter.post("/expenses", userAuthentication, async (req, res) => {
    let expenseValidData = z.object({
        imageUrl: z.string().url(),
        name: z.string().min(2, "Name must be at least 2 characters long"),
        category: z.string().min(2, "Category must be at least 2 characters long"),
        price: z.number().min(0, "Price must be positive"),
        description: z.string().min(2, "Description must be at least 2 characters long")
    });

    let validateData = expenseValidData.safeParse(req.body);

    if (validateData.success) {
        let userId = req.userId;
        let { imageUrl, name, category, price, description } = req.body;

        try {
            let newExpense = await expenseModel.create({
                userId,
                imageUrl,
                name,
                category,
                price,
                description
            });

            await userModel.updateOne(
                { _id: userId },
                { $push: { expenses: newExpense._id } }
            );

            res.json({
                message: "Expense Added Successfully",
                data: newExpense
            });
        } catch (e) {
            res.status(500).json({
                message: "Error while adding expense",
                error: e
            });
        }
    } else {
        res.status(401).json({
            message: validateData.error.issues[0].message,
            description: validateData.error.issues[0].path
        });
    }
});

userRouter.get("/expenses", userAuthentication, async (req, res) => {
    try {
        let userId = req.userId;
        console.log(userId);

        let user = await userModel.findById(userId);
        // console.log(user);

        if (user) {
            let userExpenses = await expenseModel.find({
                userId: userId
            });
            console.log(userExpenses);

            res.json({
                message: "Data Fetched Successfully",
                data: userExpenses
            });
        } else {
            res.status(401).json({
                message: "User doesn't exist"
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Error while fetching data",
            error: e
        });
    }
});

module.exports= {
    userRouter
}

//i have to do two things, first create users schema and add the survey form data in the signup and store it in db
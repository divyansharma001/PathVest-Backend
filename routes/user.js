const express = require("express");
const userRouter = express.Router();
const { userModel, savingsModel, expenseModel, financialModel } = require("../database/databaseIndex");
const bcrypt = require("bcrypt");
const saltingRounds = 10;
const env = require("dotenv");
env.config();
const jwt = require("jsonwebtoken");
const Secret_Key = process.env.Secret_Key;
const z = require("zod");
const { userAuthentication } = require("../middlewares/usermiddleware");

// Validation schemas
const signupSchema = z.object({
    email: z.string().email()
        .min(3, "Email must be at least 3 characters long")
        .max(30, "Email must not exceed 30 characters"),
    name: z.string()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must not exceed 50 characters")
        .regex(/^[a-zA-Z\s\-]+$/, "Name can only contain letters, spaces, and hyphens"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(30, "Password must not exceed 30 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    age: z.number().int().min(18, "Age must be at least 18"),
    risk: z.number().min(0).max(10, "Risk must be between 0 and 10"),
    monthlyIncome: z.number().min(0, "Monthly income must be positive"),
    insurances: z.array(z.string()),
    estimatedExpenses: z.number().min(0, "Estimated expenses must be positive"),
    savingorInvestement: z.object({
        mutualFunds: z.record(z.string(), z.string()).optional(),
        virtualGold: z.number().min(0, "Virtual gold value must be non-negative").optional(),
        equity: z.record(z.string(), z.string()).optional(),
    })
});

// Error handler middleware
const errorHandler = (res, error, customMessage = "An error occurred") => {
    console.error(error);
    return res.status(500).json({
        message: customMessage,
        error: error.message
    });
};

// Signup endpoint
userRouter.post('/signup', async (req, res) => {
    try {
        const validateData = signupSchema.safeParse(req.body);
        
        if (!validateData.success) {
            return res.status(400).json({
                message: validateData.error.issues[0].message,
                path: validateData.error.issues[0].path
            });
        }

        const { email, password, name, age, risk, monthlyIncome, insurances, estimatedExpenses, savingorInvestement } = validateData.data;
        
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltingRounds);
        
        const newUser = await userModel.create({
            email,
            name,
            password: hashedPassword,
            age,
            risk,
            monthlyIncome,
            insurances,
            estimatedExpenses
        });

        const newSavings = await savingsModel.create({
            userId: newUser._id,
            email,
            ...savingorInvestement
        });

        const token = jwt.sign({ userId: newUser._id }, Secret_Key, { expiresIn: '24h' });

        return res.status(201).json({
            message: `Signup complete for ${newUser.name}!`,
            token
        });

    } catch (error) {
        return errorHandler(res, error, "Error during signup");
    }
});

// Login endpoint
userRouter.post("/login", async (req, res) => {
    try {
        const loginSchema = z.object({
            email: z.string().email(),
            password: z.string().min(8)
        });

        const validateData = loginSchema.safeParse(req.body);
        
        if (!validateData.success) {
            return res.status(400).json({
                message: validateData.error.issues[0].message,
                path: validateData.error.issues[0].path
            });
        }

        const { email, password } = validateData.data;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "User doesn't exist! Please sign up first." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ userId: user._id }, Secret_Key, { expiresIn: '24h' });

        return res.status(200).json({
            message: `Welcome back, ${user.name}!`,
            token
        });

    } catch (error) {
        return errorHandler(res, error, "Error during login");
    }
});


userRouter.get("/", async (req, res) => {
    try {
        const userId = req.body.email; // From authentication middleware
        //add data to financial model with the user email and the data from the survey form
       

        const user = await userModel.findOne({email: userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const financialGoal = await financialModel.findOne({email: userId});
        const savings = await savingsModel.find({ email: userId });
        return res.status(200).json({
            message: "Data fetched successfully",
            data: { ...user.toObject(), savings, financialGoal}
        });

        // const savings = await savingsModel.find({ email: userId });

    } catch (error) {
        return errorHandler(res, error, "Error fetching user data");
    }
});

// Add expense
userRouter.post("/expenses", async (req, res) => {
    try {
        const expenseSchema = z.object({
            imageUrl: z.string().url(),
            name: z.string().min(2),
            category: z.string().min(2),
            price: z.number().positive(),
            description: z.string().min(2)
        });

        const validateData = expenseSchema.safeParse(req.body);
        
        if (!validateData.success) {
            return res.status(400).json({
                message: validateData.error.issues[0].message,
                path: validateData.error.issues[0].path
            });
        }

        const userId = req.body.email; // From authentication middleware
        const newExpense = await expenseModel.create({
            email: userId,
            ...validateData.data
        });

        await userModel.findOneAndUpdate(
            userId,
            { $push: { expenses: newExpense._id } }
        );

        return res.status(201).json({
            message: "Expense added successfully",
            data: newExpense
        });

    } catch (error) {
        return errorHandler(res, error, "Error adding expense");
    }
});

// Get expenses
userRouter.get("/expenses", async (req, res) => {
    try {
        const userId = req.body.email; // From authentication middleware
        const expenses = await expenseModel.find({ email: userId });
        
        return res.status(200).json({
            message: "Expenses fetched successfully",
            data: expenses
        });

    } catch (error) {
        return errorHandler(res, error, "Error fetching expenses");
    }
});

//create a registration endpoint , that takes in the survey form data, same as it was taken in the signup ep and stores it in the db    
userRouter.post("/register",async (req,res)=>{
    // let userId=req.userId;
    let userId=req.body.email;
    // console.log(userId);
    
    let user=await userModel.findOne({email: userId});
    
    
    if(user){
        let userSurveyData=req.body;

        try{
            let surveyData=await userModel.updateOne({email: userId},userSurveyData);
            const financialGoal = await financialModel.create({
                email: userId,
                goalType: req.body.goalType,
                targetAmount: req.body.targetAmount,
                timeFrame: req.body.timeFrame,
                priority: req.body.priority   //{email,goalType,targetAmount,timeFrame,priority,assetClass,allocationPercentage}  
            });
            const assetClass = await assetModel.create({
                email: userId,
                assetClass: req.body.assetClass,
                allocationPercentage: req.body.allocationPercentage
            });
            res.json({
                message: "User Survey Data Added Successfully",
                data: {surveyData, financialGoal}
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

//create a get endpoint that fetches the user data and the survey form data
userRouter.get("/register",async (req,res)=>{
    let userId=req.body.email;
    let user=await userModel.find({email: userId});

    if(user){
        res.json({
            message: "Data Fetched Successfully",
            data: user
        })
    }
    else{
        res.status(401).json({
            message: "User doesn't exist"
        })
    }
})
//edit the user data and the survey form data
userRouter.put("/register",async (req,res)=>{
    let userId=req.body.email;
    let user=await userModel.find({email: userId});

    if(user){
        let userSurveyData=req.body;
       
        
        try{
            let surveyData=await userModel.updateOne({email: userId},{
                age: req.body.age,
                riskProfile: req.body.riskProfile,
                monthlyIncome: req.body.monthlyIncome,
                insurences: req.body.insurences,
                estimatedExpenses: req.body.estimatedExpenses
            });
            newSavings=await savingsModel.create({
                email: req.body.email,
                equity: req.body.savingorInvestement.equity,
                mutualFunds: req.body.savingorInvestement.mutualFunds,
                virtualGold: req.body.savingorInvestement.virtualGold,
            })
            res.json({
                message: "User Survey Data Updated Successfully",
                data: surveyData
            })
        }
        catch(e){
            res.status(500).json({
                message: "Error while updating user survey data",
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


module.exports = { userRouter };
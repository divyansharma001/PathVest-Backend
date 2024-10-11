const express=require("express");
const userRouter=express.Router();

const {userModel, courseModel, instructorModel, purchasesModel,courseContentModel,lessonModel,sectionModel}=require("../database/databaseIndex")

const bcrypt=require("bcrypt");
const saltingRounds=10;

const env=require("dotenv");
env.config();

const jwt=require("jsonwebtoken");
const Secret_Key=process.env.Secret_Key;

const z=require("zod")

const {userAuthentication} = require("../middlewares/usermiddleware")

userRouter.post("/signup",async (req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    let username=req.body.name;
    
    if(email&&password&&username){

        try{
            let hashedPass=await bcrypt.hash(password,saltingRounds);
            
            await userModel.create({
                email,
                username,
                password: hashedPass
            })
            
            let token=jwt.sign({
                email
            },Secret_Key)
    
            res.json({
                message: "Account created succesfully",
                token
            })
            return
        }
        catch(err){
            if(err.code===11000){
                res.status(401).json({
                    message: "Email already exists"
                })
                return;
            }
            res.status(401).json({
                message: "There was an error creating account",
                errorStatus: err
            })
            return;
        }
    }
    else{
        res.status(401).json({
            message: "No Email, Name or Password provided",
            email,
            username,
            password
        })
        return;
    }
})

userRouter.post("/login",async (req,res)=>{
    let email=req.body.email;
    let password=req.body.password;

    let userFound=await userModel.findOne({
        email
    })

    if(userFound){
        let passMatched=false;
        try{
            passMatched=await bcrypt.compare(password,userFound.password);
        }
        catch(e){
            res.status(401).json({
                message: "Internal Error",
                errorStatus: e
            })
            return
        }
        if(passMatched){

            let token=jwt.sign({
                email,
                role: "user"
            },Secret_Key)
    

            res.json({
                message: "Login Succesful",
                token
            })
            return
        }
        else{
            res.status(401).json({
                message: "Incorrect Password!"
            })
            return
        }
    }
    else{
        res.status(401).json({
            message: "No user exists with this email, SignUp First!"
        })
        return
    }
})

// userRouter.use(userAuthentication);

userRouter.post("/purchases",userAuthentication,(req,res)=>{
    res.json({
        message: "Purchasing Course"
    })
})




userRouter.post('/signup',async (req, res) => {
// {email: "user-id-generated-on-server, name: "smthn", profileImg: "generated-randomly-on-BE", }
// received-payload: {username: "wewef", name: "asca",password: "casa"}

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
   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })

    let validateData=signupValidData.safeParse(req.body);

    if(validateData.success){

        let username=req.body.email;
        let password=req.body.password;
        
        try{
            hashedPassword=await bcrypt.hash(password,saltingRounds)
            newUser=users.create({
                email,
                name: req.body.name,
                password: hashedPassword,
                profileImg: profilePictures[Math.floor(Math.random()*profilePictures.length)]
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
        },JWT_SECRET); 

        res.status(200).json({
            message: `Signup Complete, for ${req.body.name}!!!`,
            token: token,
            profileImg: newUser.profileImg,
            email
        });
        return;
    }
    else{
        res.status(401).json({
            message: validateData.error.issues[0].message,
        });
        return;
    }    
});
     

userRouter.post("/login",async (req,res)=>{

    let loginValidData=z.object({
        email: z.email()
        .min(3,"Email must be at least 3 characters long"),

        password: z.string
        .min(8,"Password must be at least 8 characters long")
        .max(30, "Password must not exceed 30 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/, 
   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    })

    let validateData=loginValidData.safeParse(req.body)

    if(validateData.success){
        let email=req.body.email;
        let password=req.body.password;

        let userFound=userModel.findOne({email});
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
                userId: newUser._id
            },JWT_SECRET); 

            res.json({
                message: `Hey ${userFound.name}!, you are Logged In!!!!`,
                token: token,
                username: userFound.username
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
            message: validateData.error.issues[0].message
        })
        return;
    }
});


module.exports= {
    userRouter
}

//i have to do two things, first create users schema and add the survey form data in the signup and store it in db
const express=require("express");
const app=express();

const env=require("dotenv")
env.config()

const cors=require("cors")

const mongoose=require("mongoose")
const connectionString=process.env.databaseConnectionString;

let {userRouter} =require("./routes/user");
let {chatRouter}=require("./routes/chat")
let {recommendationsRouter}=require("./routes/recommendations")

app.use(cors())//will change this later

app.use(express.json());

app.use("/user",userRouter);
app.use("/chat",chatRouter);
app.use("/recommendations",recommendationsRouter);

app.get("/healthy", (req, res)=> res.send("I am Healthy"));

async function main(){
    try{
        await mongoose.connect(connectionString);
        app.listen(4000,()=>{console.log("The Server is Running at port: 4000");
        });
    }
    catch(err){
        console.log("Error connecting to the DB, closing server till connection succeds. Err Status: "+err);
    }
}
main();
//otp for validation??
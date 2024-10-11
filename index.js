const express=require("express");
const app=express();

const env=require("dotenv")
env.config()

const cors=require("cors")

const mongoose=require("mongoose")
const connectionString=process.env.databaseConnectionString;

let {userRouter} =require("./routes/user");

app.use(cors())

app.use(express.json());

app.use(userRouter);

app.get("/healthy", (req, res)=> res.send("I am Healthy"));

async function main(){
    try{
        await mongoose.connect(connectionString);
        app.listen(3000);
    }
    catch(err){
        console.log("Error connecting to the DB, closing server till connection succeds. Err Status: "+err);
    }
}
main();
//otp for validation??
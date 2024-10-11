const express=require("express");
const app=express();

const mongoose=require("mongoose")
// let user=require("./database/index").userModel

// const bcrypt=require("bcrypt");
// const saltingRounds=10;

// const jwt=require("jsonwebtoken");
// const Secret_Key="sdkcjnsdc892ewln";

let {userRouter} =require("./routes/user");
let {courseRouter} =require("./routes/course");
let {adminRouter}=require("./routes/admin");

app.use(express.json());

app.use("/user",userRouter);//now we can remove /user from every routes, this make the codemore redable and prefixes can now be givento it
app.use("/user/course",courseRouter);//bigger benifit of this comes in the prod, when new apis version are to be introduced, new routers
// can be created and worked upon also while the older one in prod and by simple changing the prefix to change all the routers

//buildscript basically complies all the js code in the single file
app.use("/admin",adminRouter)
// app.use("/admin",adminRouter2)//this route handeler will be activated when the first one fails

//to learn how to store images uploaded by user

// if to host my full-stack sites there are two options, forstone is to host all the files on be(similar to what i did for balanzio)
// or host them seperately, what will be the best approach?? The second one bcz it will be cheaper to host static sites on cds, that
// hosting all the files on server(any virtual machine), it will increase the bandwidth of the vm, vm will spend lot of time computing
// than serving

async function main(){
    try{
        await mongoose.connect("mongodb+srv://randomadmin:9mVRp2O5Y9AI6Erz@cluster0.if7ev.mongodb.net/CourseSelling");
        //the CourseSelling is the name of database, new database can be created just by replacing the string with new database name
        app.listen(3000);
    }
    catch(err){
        console.log("Error connecting to the DB, closing server till connection succeds. Err Status: "+err);
    }
}
main();

// shortcut: cmd+shift+l selects all duplicates at once

//debouncer is basically limmiting too many backend calls

//oauth is a protocol

// how to send otp??
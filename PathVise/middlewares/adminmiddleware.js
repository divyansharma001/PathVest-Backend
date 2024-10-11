const {Router}=require("express");
const router=Router;

//will have to rearn how to refresh tokens

const jwt=require("jsonwebtoken");
const Secret_Key="sdkcjnsdc892ewln";

function adminAuthentication(req,res,next){//token will be received in the header, with key authorizationn
    let token=req.headers.authentication;
    if(token){
        try{
            let {email,role}=jwt.verify(token,Secret_Key);
            req.email=email;
            if(role===admin){
                req.role=role
                next()
            }
            else{
                res.status(401).json({
                    message: "You cannot acess this as an user!!",
                    errStatus: err
                })
            }
        }
        catch(err){
            res.status(401).json({
                message: "Invalid token provided!!",
                errStatus: err
            })
        }
    }
    else{
        res.status(401).json({
            message: "You've to LogIn first to acess this endpoint!"
        })
    }
}

module.exports={
    adminAuthentication
}
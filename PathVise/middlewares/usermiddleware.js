const {Router}=require("express");
const router=Router;

//will have to rearn how to refresh tokens

const jwt=require("jsonwebtoken");
const Secret_Key="sdkcjnsdc892ewln";

function userAuthentication(req,res,next){//token will be received in the header, with key authorizationn
    let token=req.headers.authentication;
    if(token){
        try{
            let {email,role}=jwt.verify(token,Secret_Key);
            req.email=email;//well the problem with this approach is ki, if the user delets his acc, this will still give them
            // the acesss to the endpoint, maybe refreshing tokens can solve this issue
            req.role=role
            next()
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
    userAuthentication
}
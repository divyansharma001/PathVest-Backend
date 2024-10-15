const env=require("dotenv");
env.config()

const jwt=require("jsonwebtoken");
const Secret_Key=process.env.Secret_Key;

function userAuthentication(req,res,next){//token will be received in the header, with key authentication
    let token=req.headers.authentication;
    // let token=authentication.split(" ")[1];//Bearer token
    if(token){
        try{
            let {userId}=jwt.verify(token,Secret_Key);
            req.userId=userId;//well the problem with this approach is ki, if the user delets his acc, this will still give them
            // the acesss to the endpoint, maybe refreshing tokens can solve this issue

            // to handle deletions, i can simply do 3 things: 1. put the token in blacklist and store it in cache using redis
            // 2. revoke the token, means simply store it in cache memory or db and check if the received token=is revked already
            // 3. acess and refresh token approach, where acess token expires earlier than refresh tokens

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
            message: "You've to LogIn/SignUp first to acess this endpoint!"
        })
    }
}

module.exports={
    userAuthentication
}
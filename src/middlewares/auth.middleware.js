import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/JWT/jwtTokens.js";


const authMiddleware = asyncHandler(async(req,_,next)=>{
    
    // console.log("current user");
    const token = req.cookies.accessToken || 
    (req.headers.Authorization?.startsWith("Bearer ") 
    ? req.headers.Authorization.split(" ")[1] 
    : null);
    
    if(!token){
        throw new ApiError(401,"Token Not Found , Unauthaurised")
    }

    
    const fetchedUser = verifyAccessToken(token)
    
    
    if(!fetchedUser ){
        throw new ApiError(401,"Token verification error")
    }
    
    // console.log(fetchedUser);
    

    const user  = await User.findOne({githubId:fetchedUser.id}).select("-refreshToken")
    

    if(!user){
        throw new ApiError(401,"Token verification error, user not found")
    }

    req.user = user

    next()

})


export {
    authMiddleware
}
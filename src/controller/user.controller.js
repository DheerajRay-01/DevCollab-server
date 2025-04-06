import axios from "axios";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAllRepoData, getGitHubUserData } from "../utils/gitHubApiCalls/githubUserData.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/JWT/jwtTokens.js";

const options = {
  httpOnly: true, 
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
};


const accessTokenOptions = { ...options, maxAge: 15 * 60 * 1000 }; // 15 min
const refreshTokenOptions = { ...options, maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 days


const signIn = asyncHandler(async (req, res, next) => {
  const requestToken = req.query.code;

  if (!requestToken) {

    throw new ApiError(401, "request Code token is missing");
  }

  const responseData = await axios.post(
    `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${requestToken}`,
    {
      headers: {
        accept: "application/json",
      },
    }
  );
  if (!responseData.data) throw new ApiError(401, "Authorization token is missing");

  
  const params = new URLSearchParams(responseData.data);
  const access_token = params.get("access_token");
  // console.log(access_token);
  
  
  const user = await getGitHubUserData(access_token);
  if (!user) {
    throw new ApiError(400, "Error fetching GitHub user data");
  }
  // console.log(user.repoList);
  

  const JWT_accessToken = generateAccessToken(user);
  const JWT_refreshToken = generateRefreshToken(user);
  
  // Check if user exists in the database
  let existingUser = await User.findOne({
    $or: [{ githubId: user.id }, { login: user.login }],
  });
  
  // console.log("testing :",user);
  
  if (existingUser) {
    await User.findByIdAndUpdate(existingUser._id, {
      access_token: access_token,
      refreshToken: JWT_refreshToken,
    },
    { new: true }
  );
} else {
  // If user does not exist, create a new one
  existingUser = await User.create({
    githubId: user.id,
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url || "",
    bio: user.bio || "",
    html_url: user.html_url,
    email: user.email || "",
    twitter_username: user.twitter_username || "",
    public_repos: user.public_repos,
    followers: user.followers,
    following: user.following,
    total_contributions: user.total_contributions,
    starred_repos: user.starred_repos,
    top_languages: user.top_languages,
    access_token: access_token, // Store GitHub token for future API calls
    refreshToken: JWT_refreshToken,
  });
  
  // console.log("testing :",existingUser);
  if (!existingUser) {
    throw new ApiError(500, "Error creating user in database");
  }
}

  // Retrieve user data excluding tokens
  const SignedInUser = await User.findById(existingUser._id).select(
    "-access_token -refreshToken"
  );

  if (!SignedInUser) {
    throw new ApiError(500, "Error retrieving signed-in user data");
  }

  return res
    .status(200)
    .cookie("accessToken", JWT_accessToken, accessTokenOptions)
    .cookie("refreshToken", JWT_refreshToken, refreshTokenOptions)
    .redirect(process.env.CORS_ORIGIN);
});


const refreshAccessToken = asyncHandler(async (req, res) => {

  const token = req.cookies.refreshToken;

  let verifyToken;
  try {
    verifyToken = verifyRefreshToken(token);
  } catch (error) {


    return res
      .status(401)
      .clearCookie("accessToken", { ...options, expires: new Date(0) })
      .clearCookie("refreshToken", { ...options, expires: new Date(0) })
      .json(new ApiResponse(401, {}, "Invalid or expired refresh token"));
  }

  const storedToken = await User.findOne({ githubId: verifyToken?.id })
    .select("refreshToken")
    .lean();

  if (!storedToken) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Refresh Token not found in database"));
  }

  if (token !== storedToken.refreshToken) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid Refresh Token"));
  }


  const newAccessToken = generateAccessToken(verifyToken);

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .json(new ApiResponse(200, {}, "Token Refresh SuccessFully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "Current User Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Current User Found"));
});


const userLogout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, " User Not Found");
  }
  const logOutUser = await User.findByIdAndUpdate(
    userId,
    { refreshToken: "", access_token: "" },
    { new: true }
  );

  if (!logOutUser) {
    throw new ApiError(400, "error in Updating user while LogOut");
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LogOut Successfully"));
});


const getAllRepo = asyncHandler(async (req, res) => {
  try {
      const user = req.user;
      if (!user) {
          throw new ApiError(401, "User not authenticated");
      }

      // Fetch user access token from the database
      const userData = await User.findById(user._id).select("access_token");
      if (!userData || !userData.access_token) {
          throw new ApiError(400, "Access token not found in database");
      }

      const access_token = userData.access_token;
      console.log("Access Token:", access_token);

      // Fetch repositories from GitHub
      const repoData = await getAllRepoData(access_token);
      console.log("Fetched Repos:", repoData);

      // Send repo data as response
      res.status(200).json(new ApiResponse(200,repoData,"repo fetched"));
  } catch (error) {
      console.error("Error in getAllRepo:", error);
      res.status(error.statusCode || 500).json({ 
          success: false, 
          message: error.message || "Internal Server Error" 
      });
  }
});


const getUserProfile = asyncHandler(async (req ,res)=>{
  const userId = req.query.userId
  if(!userId){
    throw new ApiError(401, "User id not found");
  }
      try {
        const user = await User.findOne({login:userId})
        if(!user){
          throw new ApiError(401, "User not fetched from DB");
        }
        res.status(200).json(new ApiResponse(200,user,"repo fetched"));
           
      } catch (error) { 
        console.error("Error in getUserProfile:", error);
        res.status(error.statusCode || 500).json({ 
            success: false, 
            message: error.message || "Internal Server Error" 
        });
      }

  console.log(userId);
  
})

export { signIn, getCurrentUser, userLogout, refreshAccessToken ,getAllRepo, getUserProfile};

import { Saved } from "../models/saved.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";


const savePost = asyncHandler(async (req, res) => {

    // console.log(req.user);
    
    try {
      // const {name,login,avatar_url} = req.user; // `req.user` should be set by authentication middleware
      const user = req.user._id; // `req.user` should be set by authentication middleware
      const { post ,postName ,name,login,avatar_url} = req.body; // Extract post ID from request body
      console.log(postName);
      
  
      if(!user || ! post){
        throw new ApiError(400,"post /user not found")
      }

      const [postData , existingSave] = await Promise.all([
        Post.findById(post),
        Saved.findOne({  user ,post })
      ])
  
      let changeSaved;
      let message;
      let savedStatus;
  
      if (existingSave) {
        // Unsave (delete) the post
        changeSaved = await Saved.findByIdAndDelete(existingSave._id);
        postData.postSaved = Math.max(0, postData.postSaved - 1);
        message = "Post unsaved successfully";
        savedStatus = false
        // console.log("Post Unsaved:", changeSaved);
      } else {
        // Save the post
        // changeSaved = await Saved.create({ post , postData,user:_id,name,login,avatar_url });
        changeSaved = await Saved.create({ post , postData,postName,user,name,login,avatar_url});
        postData.postSaved += 1;
        savedStatus =true;
        message = "Post saved successfully";
        // console.log("Post Saved:", changeSaved);
  
    }
    await postData.save()
    return res.status(201).json(new ApiResponse(201, {changeSaved , savedStatus}, message));

    } catch (error) {
      console.error("Error saving post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });


  const isSaved = asyncHandler(async (req, res) => {
    const user = req.user._id; // `req.user` should be set by authentication middleware
    const { post } = req.body; // Extract post ID from request body

    // console.log("User:", user, "Post:", post);

    if (!user || !post) {
        return res.status(400).json(new ApiResponse(400, null, "Post/User not found"));
    }

    // Check if the post is saved by the user
    const isExist = await Saved.exists({ post, user }); 

    return res.status(200).json(new ApiResponse(200, { isSaved: !!isExist }, "Success"));
});

const getAllSavedPost = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User not found for saved posts");
    }

    // const allSaved = await Saved.find({ user: userId }).lean();
    const allSaved = await Saved.find({ user: userId })

    if (allSaved.length < 0) {
        throw new ApiError(404, "No saved posts found");
    }

    return res.status(200).json(new ApiResponse(200, allSaved, "All saved posts fetched successfully"));
});



  
export{
    savePost,
    isSaved,
    getAllSavedPost
}
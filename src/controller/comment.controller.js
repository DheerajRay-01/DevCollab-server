import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js"

const setComment = asyncHandler(async (req, res) => {
    const { comment, postId } = req.body;
    const userId = req.user._id;
    const avatar_url = req.user.avatar_url;
    const login = req.user.login;
  
    if (!comment || !postId) {
      throw new ApiError(400, "Comment text and Post ID are required.");
    }
  
    const newComment = await Comment.create({
      comment,
      postId,
      avatar_url,
      userId,
      username: login,
    });
  
    if (!newComment) {
      throw new ApiError(500, "Error creating comment.");
    }
  
    console.log("New Comment Created:", newComment);
    return res.status(200).json(new ApiResponse(200,newComment,"Comment Addded "));
  });
  

  const getComment = asyncHandler(async (req, res) => {
    const postId = req.query.postId;
    // console.log("Fetching comments for post:", postId);
  
    if (!postId) {
      throw new ApiError(400, "Post ID is required.");
    }
  
    const allComments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
  
    // No need to check for falsy, as an empty array is valid
    return res.status(200).json(new ApiResponse(200,allComments,"Comments fetched"));
  });
  

  const deleteComment = asyncHandler(async(req, res)=>{
    const commentId = req.query.commentId;
    // console.log("Fetching comments for post:", postId);
  
    if (!commentId) {
      throw new ApiError(400, "Post ID is required.");
    }
  
    const deleteComments = await Comment.findByIdAndDelete(commentId);
  
  
    return res.status(200).json(new ApiResponse(200,deleteComments,"Comment deleted "));
  })
  
export {
    setComment,
    getComment,
    deleteComment
}
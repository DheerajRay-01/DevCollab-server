import  { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchCompleteRepoData, fetchSearchedRepoData } from "../utils/gitHubApiCalls/githubRepoData.js";
import {Saved} from '../models/saved.model.js'

const getRepoData = asyncHandler(async (req, res) => {
    const { repo } = req.query; // Get repo name from query params
    if (!repo) {
        throw new ApiError(400, "Repo name is required");
    }

    const user = req.user; // Get user from request
    if (!user) {
        throw new ApiError(401, "User authentication failed in getRepoData");
    }

    // Fetch user token from DB
    const userData = await User.findById(user._id).select("access_token");
    if (!userData || !userData.access_token) {
        throw new ApiError(400, "Access token not found in database");
    }

    const access_token = userData.access_token;
    const {  login } = user;

    try {
        // Fetch GitHub repo data
        const repoData = await fetchSearchedRepoData( login, access_token, repo);

        
        res.status(200).json(new ApiResponse(200, { repo: repoData }, "success"));
    } catch (error) {
        console.error("Error fetching repo data:", error);
        throw new ApiError(404, "Repository does not exist or cannot be accessed");
    }
});


const createPost = asyncHandler(async (req, res) => {
    try {
        const { repo } = req.query; // Get repo name from query params
        if (!repo) {
            throw new ApiError(400, "Repo name is required");
        }

        const user = req.user; // Get authenticated user
        if (!user) {
            throw new ApiError(401, "User authentication failed in getRepoData");
        }

        // Fetch user token from DB
        const userData = await User.findById(user._id).select("access_token login");
        if (!userData || !userData.access_token) {
            throw new ApiError(400, "Access token not found in database");
        }

        const access_token = userData.access_token;
        const login = userData.login || user.login; // Ensure login is retrieved

        if (!login) {
            throw new ApiError(400, "GitHub login username not found");
        }

        // console.log("Fetching complete repo data for:", repo);
        const completeRepoData = await fetchCompleteRepoData(login, access_token, repo);

        if (!completeRepoData) {
            throw new ApiError(404, "Failed to fetch repository data from GitHub");
        }

        // console.log("Complete Repo Data:", completeRepoData);

        res.status(200).json(new ApiResponse(200,{repoData: completeRepoData}, "success"));

    } catch (error) {
        console.error("Error in createPost:", error);
        res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message || "Internal Server Error"));
    }
});


const uploadingPost = asyncHandler(async (req, res) => {
    const data = req.body;
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }

    // console.log("user:",user);
    

    if (!data || !data.repoName || !data.url) {
        throw new ApiError(400, "Missing required fields (repoName, url)");
    }

    try {
        // const uploadPost = await Post.create({ ...data, user:user._id,name:user.name, avatar_url:user.avatar_url});
        const [uploadPost,updatedPostCount] = await Promise.all([
            Post.create({ ...data, user:user._id,name:user.name, avatar_url:user.avatar_url}),
            User.findByIdAndUpdate(user._id,{ $inc: { posts_created: 1 } },{ new: true }),
        ])

        if (!uploadPost || !updatedPostCount) {
            throw new ApiError(500, "Failed to Upload Post");
        }

        // console.log("Uploaded post:", uploadPost);

        return res.status(201).json(
            new ApiResponse(201, uploadPost, "Successfully uploaded")
        );
    } catch (error) {
        throw new ApiError(500, "Error uploading post");
    }
});


const getPostById = asyncHandler(async (req, res) => {
    const post_id = req.params.post_id || req.query.post_id;
    

    if (!post_id) {
        throw new ApiError(400, "Post ID is required");
    }

    const post = await Post.findById(post_id);

    if (!post) {
        throw new ApiError(404, "Post not found in database");
    }

    // console.log("Fetched post:", post);

    return res.status(200).json(new ApiResponse(200, post, "Post retrieved successfully"));
});

const getMyPosts = asyncHandler(async(req,res)=>{
    const user = req.user._id
    if (!user) {
        throw new ApiError(401, "Unauthorized: User not found");
    }

    const posts = await Post.find({user}).select("repoName description contributorCount issuesCount languages isPublic")
    if(!posts){
        throw new ApiError(401, "error in fetch posts");
    }
    return res.status(200).json(new ApiResponse(200, posts, "Post retrieved successfully"));

})

const getAllPost = asyncHandler(async (req, res) => {
    const page = req.query.p
    const limit = req.query.l
    const skip = page * limit
    console.log("page",page);   
    console.log("limit",limit);       
    
    try {
        const allPosts = await Post.find({isPublic:true})
            .select("name login avatar_url ownerProfile repoName description languages issuesCount contributorCount url issues_url postSaved createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        console.log(`Fetched ${allPosts.length} posts`);

        return res.status(200).json(new ApiResponse(200, allPosts, "Fetched successfully"));
    
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw new ApiError(500, "Error fetching posts");
    }
});

const deletePost = asyncHandler(async (req, res) => {
    const post_id = req.params.post_id || req.query.post_id;
    const user = req.user._id

    if (!post_id) {
        throw new ApiError(400, "Post ID is required");
    }

    try {
        // const deletedPost = await Post.findByIdAndDelete(post_id);
        const [deletedPost, deletedSavedPostData, userData] = await Promise.all([
            Post.findByIdAndDelete(post_id),
            Saved.findOneAndDelete({ post: post_id }),
            User.findById(user)
          ]);
          
          userData.posts_created = Math.max(0, userData.posts_created - 1);
          await userData.save();
          
        // console.log(deletedPost);
        
        if (!deletedPost) {
            throw new ApiError(404, "Post not found or already deleted");
        }   
        // console.log(`Post deleted: ${deletedPost._id}`);

        return res.status(200).json(new ApiResponse(200, deletedPost, "Post deleted successfully"));

    } catch (error) {
        console.error("Error deleting post:", error);
        throw new ApiError(500, "Internal server error while deleting post");
    }
});

const deleteAllPost = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const login = req.user.login;
        console.log(userId,login);
        

        const [deletedPosts, deletedSaved , updateUserPostCount] = await Promise.all([
            Post.deleteMany({ user: userId }),
            Saved.deleteMany({ login }),
            User.findByIdAndUpdate(userId,{posts_created:0},{new:true})
        ]);

        if (deletedPosts.deletedCount === 0 && deletedSaved.deletedCount === 0) {
            throw new ApiError(404, "No posts or saved items found to delete");
        }

        return res.status(200).json(
            new ApiResponse(200, { deletedPosts, deletedSaved ,updateUserPostCount}, "All posts and saved items deleted successfully")
        );

    } catch (error) {
        console.error("Error deleting posts:", error);
        throw new ApiError(500, "Internal server error while deleting posts");  
    }
});




const changeVisibility = asyncHandler(async (req, res) => {
    const post_id = req.params.post_id || req.query.post_id;

    if (!post_id) {
        throw new ApiError(400, "Post ID is required");
    }

    try {

        const findPost = await Post.findById(post_id).select("isPublic");

        if (!findPost) {
            throw new ApiError(404, "Post not found");
        }
        // console.log(findPost);
        

        const updatedPost = await Post.findByIdAndUpdate(
            post_id,
            { isPublic: !findPost.isPublic }, // Corrected the boolean toggle
            { new: true } // Ensures the updated document is returned
        );

        if (!updatedPost) {
            throw new ApiError(500, "Error updating post visibility");
        }

        return res.status(200).json(new ApiResponse(200, updatedPost, "Post visibility changed"));

    } catch (error) {
        console.error("Error changing post visibility:", error);
        throw new ApiError(500, "Internal server error while updating post visibility");
    }
});



export {
  getRepoData,
  createPost,
  uploadingPost,
  getPostById,
  getMyPosts,
  getAllPost,
  deletePost,
  deleteAllPost,
  changeVisibility,
};

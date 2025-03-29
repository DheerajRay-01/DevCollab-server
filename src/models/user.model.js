import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true }, // GitHub ID (Unique)
    login: { type: String, required: true, unique: true }, // GitHub username
    name: { type: String }, // Full name from GitHub
    avatar_url: { type: String }, // Profile picture
    bio: { type: String }, // GitHub bio
    // location: { type: String }, // GitHub location
    html_url: { type: String }, // GitHub profile link
    email: { type: String },
    twitter_username: { type: String },


    // GitHub Stats
    public_repos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    total_contributions: { type: Number, default: 0 }, // Fetched from GitHub events API
    starred_repos: { type: Number, default: 0 }, // Count of starred repositories
    top_languages: { type: [String], default: [] }, // Array of top languages used
    // open_issues: { type: Number, default: 0 }, // Total open issues created

    // DevCollab Platform Data
    posts_created: { type: Number, default: 0 }, // Number of posts created
    // contributions: { type: Number, default: 0 }, // Contributions on DevCollab platform


    // OAuth Tokens 
    access_token: { type: String, select: false }, // GitHub Access Token
    refreshToken: { type: String, select: false }, // JWT Refresh Token 
  },
  { timestamps: true }
);



export const User = mongoose.model("User", UserSchema);

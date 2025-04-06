import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // GitHub Authentication & Profile Data
    githubId: { type: String, required: true, unique: true }, // Unique GitHub ID
    login: { type: String, required: true, unique: true }, // GitHub username
    name: { type: String }, // Full name from GitHub
    avatar_url: { type: String }, // Profile picture URL
    bio: { type: String }, // GitHub bio
    html_url: { type: String }, // GitHub profile link
    email: { type: String }, // User email (if available)
    twitter_username: { type: String }, // Twitter handle (if linked)

    // GitHub Statistics
    public_repos: { type: Number, default: 0 }, // Total public repositories
    followers: { type: Number, default: 0 }, // Number of followers
    following: { type: Number, default: 0 }, // Number of users followed
    total_contributions: { type: Number, default: 0 }, // Contributions (from GitHub API)
    starred_repos: { type: Number, default: 0 }, // Total starred repositories
    top_languages: { type: [String], default: [] }, // List of top used programming languages

    // DevCollab Platform Data
    posts_created: { type: Number, default: 0 }, // Count of posts created on the platform

    // Authentication Tokens (Hidden in Queries)
    access_token: { type: String, select: false }, // GitHub OAuth access token
    refreshToken: { type: String, select: false }, // JWT refresh token
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` timestamps
);

export const User = mongoose.model("User", UserSchema);

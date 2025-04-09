import mongoose from "mongoose";

const contributorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar_url: { type: String, required: true },
  url: { type: String, required: true }
});

const issueSchema = new mongoose.Schema({
    url:{type:String, required:true},
    title:{type:String},
})

const postSchema = new mongoose.Schema(
  {
    repoName: { type: String, required: true },
    url: { type: String, required: true },
    login: { type: String, required: true },
    ownerProfile: { type: String },
    forksCount: { type: Number, default: 0 },
    starCount: { type: Number, default: 0 },
    contributorCount: { type: Number, default: 0 },
    issuesCount: { type: Number, default: 0 },
    description: { type: String },
    license: { type: String },
    issues_url:{type: String},
    contributors_url:{type: String},
    fork_url:{type: String},
    stars_url:{type: String},
    lastUpdate: { type: String},
    contributors: [contributorSchema], 
    issues: [issueSchema],
    languages: { type:Map ,of :Number},
    postSaved :{type: Number, default: 0},
    user:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
    },
    name: { type: String },
    avatar_url: { type: String },
    isPublic: { type: Boolean,default:true },
  },
  {
    timestamps: true
  }
);

postSchema.index({ isPublic: 1, createdAt: -1 });

export const Post  = mongoose.model("Post", postSchema);

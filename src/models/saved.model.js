import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema(
  {
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
     },
    user:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
    },
    name:{type:String},
    postName:{type:String},
    login:{type:String},
    avatar_url:{type:String},
  },
  {
    timestamps: true
  }
);

export const Saved  = mongoose.model("Saved", SavedPostSchema);

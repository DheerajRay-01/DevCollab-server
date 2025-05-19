import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    trim: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username :{
      type: String,
      required: true,
  
    },
    avatar_url:{
        type: String,
    required: true,
    }


}, { timestamps: true });



export const Comment = mongoose.model("Comment", commentSchema);

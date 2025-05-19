import { Router } from "express";
import { changeVisibility, deleteAllPost, deletePost, getAllPost, getPostById, search } from "../controller/repo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllSavedPost, isSaved, savePost } from "../controller/saved.controller.js";
import { deleteComment, getComment, setComment, } from "../controller/comment.controller.js";

const router = Router()

router.route("/id/:post_id").get(getPostById);

router.route("/get-all-post").get(getAllPost);

router.route("/search-post").get(search);

router.route("/all-saved").get(authMiddleware,getAllSavedPost);

router.route("/change-visibility/id/:post_id").get(authMiddleware,changeVisibility);

router.route("/save").post(authMiddleware,savePost);

router.route("/is-saved").post(authMiddleware,isSaved);

router.route("/delete/id/:post_id").delete(authMiddleware,deletePost);

router.route("/delete-all").delete(authMiddleware,deleteAllPost);

router.route("/set-comment").post(authMiddleware,setComment)

router.route("/get-comment").get(authMiddleware,getComment)

router.route("/delete-comment").delete(authMiddleware,deleteComment)


export default router
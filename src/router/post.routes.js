import { Router } from "express";
import { changeVisibility, deletePost, getAllPost, getPostById } from "../controller/repo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/id/:post_id").get(getPostById);
router.route("/get-all-post").get(getAllPost);
router.route("/delete/id/:post_id").delete(authMiddleware,deletePost);
router.route("/change-visibility/id/:post_id").get(authMiddleware,changeVisibility);


export default router
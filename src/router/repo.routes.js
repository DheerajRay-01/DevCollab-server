import { Router } from "express";
import { createPost, getRepoData,uploadingPost } from "../controller/repo.controller.js";

const router = Router()

router.route("/get-data").get(getRepoData)
router.route("/create-post").get(createPost)
router.route("/uploading-post").post(uploadingPost)



export default router
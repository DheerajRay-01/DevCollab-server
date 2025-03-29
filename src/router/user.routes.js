import { Router } from "express";
import { getAllRepo, getCurrentUser, userLogout } from "../controller/user.controller.js";
import { getMyPosts } from "../controller/repo.controller.js";

const router = Router()

router.route("/get-user").get(getCurrentUser)
router.route("/logout").post(userLogout)
router.route("/my-posts").get(getMyPosts)
router.route("/my-repo").get(getAllRepo)



export default router
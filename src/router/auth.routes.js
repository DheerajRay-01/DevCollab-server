import { Router } from "express";
import { getCurrentUser, refreshAccessToken, signIn } from "../controller/user.controller.js";

const router = Router()

router.get("/callback",signIn)
router.post("/refresh-token",refreshAccessToken)

// router.get("/get-user",getCurrentUser)

export default router
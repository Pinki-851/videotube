import { Router } from "express";
import {
  loginUser,
  logout,
  userRegistration,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegistration
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT, logout);
export default router;

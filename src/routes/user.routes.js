import { Router } from "express";
import {
  changePassword,
  getCurrentUserDetail,
  getUserChannelProfile,
  getWatchlist,
  loginUser,
  logout,
  refreshToken,
  updateAvatar,
  updateUserDetail,
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
router.route("/refresh-token").post(refreshToken);

// secured route
router.route("/logout").post(verifyJWT, logout);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-current-userdetail").get(verifyJWT, getCurrentUserDetail);
router.route("/update-userdetail").put(verifyJWT, updateUserDetail);
router.route("/update-image").put(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateAvatar
);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchlist);

export default router;

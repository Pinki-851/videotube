import { Router } from "express";
import { userRegistration } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegistration
);

export default router;

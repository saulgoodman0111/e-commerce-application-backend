import express from "express";
import {
  forgotPasswordController,
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
} from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "./../middlewares/multer.js";

// ROUTER OBJ //
// Router ka R small krdena //
const router = express.Router();

// ROUTES //
// register route //
router.post("/register", registerController);

// login route //
router.post("/login", loginController);

// profile route //
router.get("/profile", isAuth, getUserProfileController);

// logout route //
router.get("/logout", isAuth, logoutController);

// update user profile route //
router.put("/profile-update", isAuth, updateProfileController);

// update user password route //
router.put("/update-password", isAuth, updatePasswordController);

// update profile pic //
router.put("/update-picture", isAuth, singleUpload, updateProfilePicController);

// FORGOT PASSWORD //
router.post("/reset-password", forgotPasswordController);


// EXPORT //
export default router;

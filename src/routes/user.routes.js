import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    deleteUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(JWTVerify, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(JWTVerify, updatePassword);
router.route("/get-current-user").post(JWTVerify, getCurrentUser);
router.route("/update-user-details").post(JWTVerify, updateUserDetails);
router
    .route("/update-avatar")
    .patch(JWTVerify, upload.single("avatar"), updateAvatar);
router
    .route("/update-cover-image")
    .patch(JWTVerify, upload.single("coverImage"), updateCoverImage);
router.route("/delete-user").delete(JWTVerify, deleteUser);

export default router;

// Exporting the router means you're exporting this configured mini-app that knows about all the routes you've defined on it.

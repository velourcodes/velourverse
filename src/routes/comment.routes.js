import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.route("/add-comment").post(JWTVerify, addComment);
commentRouter
    .route("/get-video-comments/:videoId")
    .get(JWTVerify, getVideoComments);
commentRouter
    .route("/update-comment/:commentId")
    .patch(JWTVerify, updateComment);
commentRouter
    .route("/delete-comment/:commentId")
    .delete(JWTVerify, deleteComment);

export default commentRouter;

import { Router } from "express";
import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controller.js"
import { JWTVerify } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.route("/toggle-video-like/:videoId").post(JWTVerify, toggleVideoLike)
likeRouter.route("/toggle-comment-like/:commentId").post(JWTVerify, toggleCommentLike)
likeRouter.route("/toggle-tweet-like/:tweetId").post(JWTVerify, toggleTweetLike)
likeRouter.route("/get-liked-videos").get(JWTVerify, getLikedVideos)

export default likeRouter;
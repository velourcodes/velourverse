import { Router } from "express";
import {
    createTweet,
    viewTweets,
    getUserTweets,
    updateTweet,
    deleteTweet,
    deleteAllTweetsByUser,
} from "../controllers/tweet.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

tweetRouter.route("/create-tweet").post(JWTVerify, createTweet);
tweetRouter.route("/view-tweets").get(JWTVerify, viewTweets);
tweetRouter.route("/get-user-tweets").get(JWTVerify, getUserTweets);
tweetRouter.route("/update-tweet/:tweetId").patch(JWTVerify, updateTweet);
tweetRouter.route("/delete-tweet/:tweetId").delete(JWTVerify, deleteTweet);
tweetRouter
    .route("/delete-all-tweets-by-user")
    .delete(JWTVerify, deleteAllTweetsByUser);
export default tweetRouter;

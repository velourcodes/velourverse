import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

tweetRouter.route("/create-tweet").post(JWTVerify, createTweet);
tweetRouter.route("/get-user-tweets").get(JWTVerify, getUserTweets);
tweetRouter.route("/update-tweet/:tweetId").patch(JWTVerify, updateTweet);
tweetRouter.route("/delete-tweet/:tweetId").patch(JWTVerify, deleteTweet);

export default tweetRouter;

import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter
    .route("/toggle-subscription/:channelId")
    .post(JWTVerify, toggleSubscription);
subscriptionRouter
    .route("/get-user-channel-subscribers/:channelId")
    .get(JWTVerify, getUserChannelSubscribers);
subscriptionRouter
    .route("/get-subscribed-channels/:subscriberId")
    .get(JWTVerify, getSubscribedChannels);

export default subscriptionRouter;

import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.route("/get-channel-stats").get(JWTVerify, getChannelStats);
dashboardRouter.route("/get-channel-videos").get(JWTVerify, getChannelVideos);

export default dashboardRouter;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN, // e.g. "http://localhost:4500"
        credentials: true,
    })
); // allows cookies/ auth tokens to be sent

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import Router

import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import likeRoutes from "./routes/like.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
// Define routes [through middleware]
app.use("/api/v1/users", userRoutes);
// eg of routes via middleware: http://localhost:5000/api/v1/users/register
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/tweet", tweetRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

export { app };

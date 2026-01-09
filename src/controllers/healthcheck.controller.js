import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import express from "express";
import mongoose from "mongoose";
import { memoryUsage, uptime } from "process";
import { cloudinaryPing } from "../utils/cloudinary.js";
const app = express();

const healthcheck = asyncHandler(async (req, res) => {
    const timestamp = new Date();
    const cloudinaryPingResponse = await cloudinaryPing();
    if (cloudinaryPingResponse.status !== "ok")
        throw new ApiError(424, "Cloudinary ping failed!");

    const mongoDBPingResponse = await mongoose.connection.db.admin().ping();
    if (mongoDBPingResponse.ok !== 1)
        throw new ApiError(503, "MongoDB ping failed!");

    const nodeProcessUptime = Math.floor(uptime());
    const nodeProcessMemoryStats = memoryUsage();
    if (!nodeProcessUptime) throw new ApiError(503, "Node service error!");


    return res.status(200).json(
        new ApiResponse(200, {
            status: "ok",
            timestamp,
            checks: {
                database: {
                    status: "ok", // from ping
                },
                server: {
                    status: "ok",
                    uptime: nodeProcessUptime,
                    "Heap Memory Used": nodeProcessMemoryStats.heapUsed,
                },
                cloudinary: {
                    status: "ok",
                },
            },
        }, "Healthcheck successful")
    );
});

export { healthcheck };

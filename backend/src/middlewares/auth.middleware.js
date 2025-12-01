import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";

export const JWTVerify = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.AccessToken ||
            req.header("Authorization").replace("Bearer ", "");

        /* The part after || is there incase the user is sending tokens as header from mobile phone, 
        Token general format: Bearer <token> - hence we did the replace to get the value of token*/

        if (!token) throw new ApiError(401, "Unauthorized Request!");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) throw new ApiError(401, "Invalid Access Token!");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token!");
    }
});

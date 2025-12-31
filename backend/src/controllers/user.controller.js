import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const options = {
    httpOnly: true,
    secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body;
    console.log(`Username: ${username}\nFull Name: ${fullName}`);

    if (
        [username, email, fullName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are mandatory");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser)
        throw new ApiError(
            409,
            "A user with the following email or username already exists!"
        );
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required!");

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatarResponse);
    console.log(coverImageResponse);

    if (!avatarResponse.secure_url && !avatarResponse.public_id)
        throw new ApiError(400, "Avatar file is required!");

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: {
            secure_url: avatarResponse.secure_url,
            public_id: avatarResponse.public_id,
        },
        coverImage: {
            secure_url: coverImageResponse.secure_url,
            public_id: coverImageResponse.public_id,
        },
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -public_id"
    ); // public_id should remain secure from frontend - remove it!

    if (!createdUser)
        throw new ApiError(
            500,
            "Something went wrong during registering new user!"
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                createdUser,
                "New user registered successfully!"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // fetch user details - username password
    // if username - password dont match disallow
    // if username does not exist in the database, redirect to register route
    // if username exists, and password matches (by compare of bcrypt), login user and pass tokens via cookies
    // return the response for login success

    const { username, email, password } = req.body;
    if (!username && !email)
        throw new ApiError(
            400,
            "User is required to provide either username or email for login"
        );

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) throw new ApiError(404, "User not found!");

    if (!password || password.trim() === "")
        throw (400, "Password is required");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (isPasswordValid) {
        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken -avatar.public_id -coverImage.public_id"
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken, // Sending cookies to req.body for mobile users
                    },
                    "User logged in successfully"
                )
            );
    } else throw new ApiError(401, `Invalid Password for user - ${username}`);
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(204, {}, "User was logged out successfully! "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    // For mobile users req.body is non existent

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request"); // If token is not in correct format/ empty

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) throw new ApiError(401, "Invalid Refresh Token!"); // User not valid or no user found

    console.log("Decoded Refresh Token: ", decodedToken);
    if (!(incomingRefreshToken === user.refreshToken))
        throw new ApiError(401, "Refresh Token Expired!");
    // Expired Token - Even if user is valid, refresh and login not allowed anymore

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    console.log("Before Refreshing: ", incomingRefreshToken);
    console.log("After Refreshing: ", refreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access Token Refreshed Successfully"
            )
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    // Middleware already checks for login! :D
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id); // auth middelware has the user already saved in body
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (isPasswordCorrect) {
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(
                new ApiResponse(204, null, "Passsword was updated successfully")
            );
    } else throw new ApiError(401, "Password updation failed!");
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser) throw new ApiError(404, "User not found");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                currentUser,
                "Returned current user successfully"
            )
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { username, email, fullName } = req.body;

    if (!username && !email && !fullName)
        throw new ApiError(400, "Atleast one field is required!");

    const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                username: username,
                email: email,
                fullName: fullName,
            },
        },
        { new: true } // Returns updated user document
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "User info updated sucessfully")
        );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const newAvatarLocalPath = req.file?.path;
    console.log(newAvatarLocalPath);

    if (!newAvatarLocalPath) throw new ApiError(400, "Missing avatar file");

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const avatarResponse = await uploadOnCloudinary(newAvatarLocalPath);
    if (!avatarResponse?.secure_url && !avatarResponse?.public_id)
        throw new ApiError(502, "Avatar upload failed");
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: {
                    secure_url: avatarResponse?.secure_url,
                    public_id: avatarResponse.public_id,
                },
            },
        },
        { new: true }
    ).select("-password -refreshToken -avatar.public_id -coverImage.public_id");
    // Update user and return response right away

    // Fire-and-forget (non-blocking):
    if (user?.avatar?.public_id) {
        deleteFromCloudinary(user.avatar.public_id, "image") // calling with old public_id
            .then((deletionResult) => {
                if (!(deletionResult?.result === "ok")) {
                    console.error("Old avatar deletion failed:", result);
                }
            })
            .catch((error) => {
                console.error("Old avatar deletion error:", error.message);
            });
        // No await - continue immediately
    }

    // Update user and return response right away

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const newCoverImageLocalPath = req.file?.path;
    console.log(newCoverImageLocalPath);

    if (!newCoverImageLocalPath)
        throw new ApiError(400, "Missing cover image file");

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    const coverImageResponse = await uploadOnCloudinary(newCoverImageLocalPath);
    if (!coverImageResponse?.secure_url && !coverImageResponse?.public_id)
        throw new ApiError(502, "Cover image upload failed");
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: {
                    secure_url: coverImageResponse?.secure_url,
                    public_id: coverImageResponse?.public_id,
                },
            },
        },
        { new: true }
    ).select("-password -refreshToken -avatar.public_id -coverImage.public_id");
    // Update user and return response right away

    // Fire-and-forget (non-blocking):
    if (user?.coverImage?.public_id) {
        deleteFromCloudinary(user.coverImage.public_id, "image") // calling with old public_id
            .then((deletionResult) => {
                if (!(deletionResult?.result === "ok")) {
                    console.error("Old cover image deletion failed:", result);
                }
            })
            .catch((error) => {
                console.error("Old avatar deletion error:", error.message);
            });
        // No await - continue immediately
    }
    // Update user and return response right away
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "Cover image updated successfully"
            )
        );
});

const deleteUser = asyncHandler(async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!(password === confirmPassword))
        throw new ApiError(
            400,
            "Password confirmation failed, they must match!"
        );

    const user = await User.findById(req.user?._id);

    if (!user) throw new ApiError(404, "No existing user found!");

    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) throw new ApiError(401, "Invalid Password!");

    await findByIdAndDelete(user?._id);

    deleteFromCloudinary(user.avatar.public_id, "image");
    deleteFromCloudinary(user.coverImage.public_id, "image");

    return res
        .status(200)
        .json(
            new ApiResponse(
                204,
                null,
                "User was deleted successfully from the database"
            )
        );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) throw new ApiError(400, "Username is required!");

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions", // unlike most places where we refer to the model using exported variable name, here we are querying with the name which it internally saves as in MongoDB
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscibersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedTo: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                new mongoose.Types.ObjectId(req.user._id), // value to search for
                                "$subscribers.subscriber", // array's field to check in
                            ],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscibersCount: 1,
                channelsSubscribedTo: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            },
        },
    ]); // Note: Most aggregation pipelines return data in array of object(s) format!

    if (!channel?.length) throw new ApiError(404, "Channe; not found!");

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "Channel returned successfully")
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory", // [video1, video2, video3]
                foreignField: "_id", // Match with video _id
                as: "watchHistory", // Replace the array of video _ids with actual video docs
                pipeline: [
                    // This runs on EACH matched video (whole doc)
                    {
                        // Sub-pipeline 1: Get video owner details
                        $lookup: {
                            from: "users", // [user456] or [user789]
                            localField: "owner", // Match with user _id
                            foreignField: "_id", // Add owner details array
                            as: "owner", // This runs on the owner lookup results
                            pipeline: [
                                {
                                    // To reduce the data of owner and pass it on
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        // Sub-pipeline 2: Flatten owner array
                        $addFields: {
                            owner: {
                                $first: "$owner", // Takes the FIRST element from the owner array, our video model is designed to support multiple owner per video, but for more common cases, we have one owner per video hence this logic here -> TRANSFORMS THE ARRAY OF OBJECT(S) TO JUST AN OBJECT!
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch History fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    deleteUser,
    getUserChannelProfile,
    getWatchHistory,
};

// Input: All User documents
//      ↓
// $match: Filter by username (only channel owner remains)
//      ↓
// $lookup 1: Get all subscribers (people who subscribed to this channel)
//      ↓
// $lookup 2: Get all subscriptions (channels this user subscribed to)
//      ↓
// $addFields: Calculate counts and check if current user is subscribed
//      ↓
// $project: Select only needed fields
//      ↓
// Output: Channel profile with subscription analytics

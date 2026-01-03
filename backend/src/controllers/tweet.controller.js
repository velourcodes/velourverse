import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content?.trim())
        throw new ApiError(400, "Content cannot be left blank!");

    const tweet = await Tweet.create({
        content: content,
        owner: userId,
    });

    if (!tweet) throw new ApiError(500, "Internal Server Error!");

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet added successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const { page = 1, limit = 10 } = req.query;
    let pageValue = parseInt(page);
    let limitValue = parseInt(limit);

    const totalUserTweetCount = await Tweet.countDocuments({
        owner: userId,
    });
    if (!totalUserTweetCount) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "The user has no tweets yet"));
    }

    if (limitValue <= 0 || limitValue >= 1000) limitValue = 10;
    const totalPages = Math.ceil(totalUserTweetCount / limitValue);
    if (pageValue <= 0 || pageValue > totalPages) pageValue = 1;

    const populatedUserTweets = await Tweet.aggregate([
        { $match: { owner: userId } },
        { $sort: { createdAt: -1, updatedAt: -1 } },
        { $skip: (pageValue - 1) * limitValue },
        { $limit: limitValue },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerData",
            },
        },
        {
            $unwind: "$ownerData",
        },
        {
            $project: {
                content: 1,
                ownerUsername: "$ownerData.username",
                ownerAvatarURL: "$ownerData.avatar.secure_url",
            },
        },
    ]);

    if (!populatedUserTweets.length)
        throw new ApiError(500, "Internal Server Error!");

    const pagination = {
        totalUserTweetCount: totalUserTweetCount,
        totalPages: totalPages,
        currentPage: pageValue,
        hasPrev: pageValue > 1,
        hasNext: pageValue < totalPages,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { populatedUserTweets, pagination },
                "Tweets fetched successfully"
            )
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const { content } = req.body;
    const userId = req.user?._id;

    if (!content?.trim())
        throw new ApiError(400, "Content for updation cannot be left blank!");

    if (!tweetId?.trim()) throw new ApiError("tweetId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError("Invalid tweetId passed!");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found in database!");

    if (!tweet.owner.equals(new mongoose.Types.ObjectId(userId)))
        throw new ApiError(403, "Updating tweet is forbidden!");

    tweet.content = content;
    tweet.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!tweetId?.trim()) throw new ApiError("tweetId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError("Invalid tweetId passed!");

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found in database!");

    if (!tweet.owner.equals(new mongoose.Types.ObjectId(userId)))
        throw new ApiError(403, "Updating tweet is forbidden!");

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(204, null, "Tweet deleted successfully"));
});

const deleteAllTweetsByUser = asyncHandler(async (req, res) => {
    // TODO: delete all the tweets of one single user, by taking their userId and match owner field, delete all those if present
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

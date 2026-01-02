import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    let pageValue = parseInt(page);
    let limitValue = parseInt(limit);

    const userId = new mongoose.Types.ObjectId(req.user?._id);

    if (!videoId?.trim())
        throw new ApiError(400, "videoId cannot be left blank!");
    console.log("Passed videoId is: ", videoId);

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId provided!");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found in database!");

    if (!video?.isPublished) {
        if (!video.owner[0].equals(userId)) {
            throw new ApiError(
                403,
                "Viewing comments for this video is forbidden!"
            );
        }
    }
    const totalVideoCommentCount = await Comment.countDocuments({
        video: videoId,
    });
    if (!totalVideoCommentCount) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "This video has no comments added yet"
                )
            );
    }

    if (limitValue <= 0 || limitValue >= 1000) limitValue = 10;
    const totalPages = Math.ceil(totalVideoCommentCount / limitValue);
    if (pageValue <= 0 || pageValue > totalPages) pageValue = 1;

    const currentPageComments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerData",
            },
        },
        // {
        //     $unwind: "$ownerData",
        // },
        {
            $addFields: {
                owner: { $first: "$ownerData" },
            },
        },
        {
            $project: {
                content: 1,
                ownerUsername: "$owner.username",
                ownerAvatarURL: "$owner.avatar.url",
            },
        },
    ]);
    const pagination = {
        totalVideoCommentCount: totalVideoCommentCount,
        totalPages: totalPages,
        currentPage: pageValue,
        limit: limitValue,
        hasPrev: pageValue > 1,
        hasNext: pageValue < totalPages,
    };
    if (!currentPageComments) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "No comments were found on the requested video"
                )
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { currentPageComments, pagination },
                "Comments for video fetched successfully"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId, content } = req.body;

    if (!content?.trim() || !videoId?.trim())
        throw new ApiError(400, "Content and videoId cannot be left empty!");

    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "Invalid videoId!");

    const video = await Video.findById(videoId);

    if (!video) throw new ApiError(404, "Video not found!");
    // used a mongoose pre hook to check before saving the comment if it is published or not :)

    const comment = await Comment.create({
        content: content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id),
    });

    const populatedCommentData = await Comment.aggregate([
        {
            $match: { _id: comment._id },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData",
                pipeline: [{ $project: { title: 1 } }],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerData",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatarSecureURL: "$avatar.secure_url",
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                // overwrites already exsisting 2 ObjectId fields
                video: { $first: "$videoData" },
                owner: { $first: "$ownerData" },
            },
        },
        {
            $project: {
                content: 1,
                video: 1,
                owner: 1,
            },
        },
    ]);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                populatedCommentData[0],
                "Comment successfully added on the requested video"
            )
        );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    if (!commentId?.trim())
        throw new ApiError(400, "videoId cannot be left blank!");
    if (!mongoose.Types.ObjectId.isValid(commentId))
        throw new ApiError(400, "Invalid videoId provided!");
    if (!content?.trim()) throw new ApiError(400, "No content provided!");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found in the database!");

    if (!comment?.owner.equals(userId))
        throw new ApiError(403, "Editing comment is forbidden!");

    comment.content = content;
    await comment.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    if (!commentId?.trim())
        throw new ApiError(400, "commentId cannot be left blank!");
    if (!mongoose.Types.ObjectId.isValid(commentId))
        throw new ApiError(400, "Invalid commentId passed!");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "No comment found in database!");

    console.log("\nComment to be deleted: \n\n", comment);

    if (!comment.owner.equals(userId))
        throw new ApiError(403, "Deleting comment is forbidden!");

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(204, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

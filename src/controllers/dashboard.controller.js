import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const videoPipeline = [
        {
            $match: { owner: req.user?._id },
        },
        {
            $facet: {
                overview: [
                    {
                        $group: {
                            _id: null,
                            totalViews: { $sum: "$views" },
                            averageViews: { $avg: "$views" },
                            totalDuration: { $sum: "$duration" },
                            averageDuration: { $avg: "$duration" },
                            totalVideosUploaded: { $sum: 1 },
                        },
                    },
                ],
                mostViewedVideo: [
                    {
                        $sort: { views: -1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            createdAt: 1,
                        },
                    },
                ],
                leastViewedVideo: [
                    {
                        $sort: { views: 1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            createdAt: 1,
                        },
                    },
                ],
                latestVideo: [
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                overview: { $arrayElemAt: ["$overview", 0] },
                mostViewedVideo: { $arrayElemAt: ["$mostViewedVideo", 0] },
                leastViewedVideo: { $arrayElemAt: ["$leastViewedVideo", 0] },
                latestVideo: { $arrayElemAt: ["$latestVideo", 0] },
            },
        },
    ];
    const likePipeline = [
        {
            $match: { owner: req.user?._id },
        },
        {
            $facet: {
                totalLikes: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes", // an array of docs of all likes of 1 video doc
                        },
                    },
                    {
                        $addFields: {
                            noOfLikesOnVideo: { $size: "$videoLikes" },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalLikes: { $sum: "$noOfLikesOnVideo" },
                        },
                    },
                ],
                mostLikedVideo: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes", // an array of docs of all likes of 1 video doc
                        },
                    },
                    {
                        $addFields: {
                            noOfLikesOnVideo: { $size: "$videoLikes" },
                        },
                    },
                    {
                        $sort: { noOfLikesOnVideo: -1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            duration: 1,
                            createdAt: 1,
                            noOfLikesOnVideo: 1,
                        },
                    },
                ],
                leastLikedVideo: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes", // an array of docs of all likes of 1 video doc
                        },
                    },
                    {
                        $addFields: {
                            noOfLikesOnVideo: { $size: "$videoLikes" },
                        },
                    },
                    {
                        $sort: { noOfLikesOnVideo: 1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            duration: 1,
                            createdAt: 1,
                            noOfLikesOnVideo: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalLikes: { $arrayElemAt: ["$totalLikes", 0] },
                mostLikedVideo: { $arrayElemAt: ["$mostLikedVideo", 0] },
                leastLikedVideo: { $arrayElemAt: ["$leastLikedVideo", 0] },
            },
        },
    ];
    const commentPipeline = [
        {
            $match: { owner: req.user?._id },
        },
        {
            $facet: {
                totalComments: [
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoComments",
                        },
                    },
                    {
                        $addFields: {
                            noOfComments: { $size: "$videoComments" },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalComments: { $sum: "$noOfComments" },
                        },
                    },
                ],
                mostLikedComment: [
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoComments",
                        },
                    },
                    {
                        $unwind: "$videoComments",
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "videoComments._id",
                            foreignField: "comment",
                            as: "commentLikes",
                        },
                    },
                    {
                        $addFields: {
                            commentLikeCount: { $size: "$commentLikes" },
                        },
                    },
                    {
                        $sort: { commentLikeCount: -1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "videoComments.owner",
                            foreignField: "_id",
                            as: "commenterData",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatarURL: "$avatar.secure_url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            videoId: "$_id",
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            duration: 1,
                            comment: "$videoComments.content",
                            commenterId: "$videoComments.owner",
                            commentLikeCount: 1,
                            commenterUsername: {
                                $arrayElemAt: ["$commenterData.username", 0],
                            },
                            commenterAvatar: {
                                $arrayElemAt: ["$commenterData.avatarURL", 0],
                            },
                        },
                    },
                ],
                top5MostLikedComments: [
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoComments",
                        },
                    },
                    {
                        $unwind: "$videoComments",
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "videoComments._id",
                            foreignField: "comment",
                            as: "commentLikes",
                        },
                    },
                    {
                        $addFields: {
                            commentLikeCount: { $size: "$commentLikes" },
                        },
                    },
                    {
                        $sort: { commentLikeCount: -1 },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "videoComments.owner",
                            foreignField: "_id",
                            as: "commenterData",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatarURL: "$avatar.secure_url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            videoId: "$_id",
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            views: 1,
                            duration: 1,
                            comment: "$videoComments.content",
                            commenterId: "$videoComments.owner",
                            commentLikeCount: 1,
                            commenterUsername: {
                                $arrayElemAt: ["$commenterData.username", 0],
                            },
                            commenterAvatar: {
                                $arrayElemAt: ["$commenterData.avatarURL", 0],
                            },
                        },
                    },
                ],
                top5MostRecentComments: [
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoComments",
                        },
                    },
                    {
                        $unwind: "$videoComments",
                    },
                    {
                        $sort: { "videoComments.createdAt": -1 },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "videoComments.owner",
                            foreignField: "_id",
                            as: "commenterData",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatarURL: "$avatar.secure_url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            commenterId: "$videoComments.owner",
                            comment: "$videoComments.content",
                            title: 1,
                            thumbnailURL: "$thumbnail.secure_url",
                            commenterUsername: {
                                $arrayElemAt: ["$commenterData.username", 0],
                            },
                            commenterAvatar: {
                                $arrayElemAt: ["$commenterData.avatarURL", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalComments: {
                    $arrayElemAt: ["$totalComments.totalComments", 0],
                },
                mostLikedComment: { $arrayElemAt: ["$mostLikedComment", 0] },
                top5MostLikedComments: 1,
                top5MostRecentComments: 1,
            },
        },
    ];
    const subscriptionPipeline = [
        {
            $match: { channel: req.user?._id },
        },
        {
            $facet: {
                subscriberCount: [{ $count: "subscriberCount" }],
                newest5Subscribers: [
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "subscriber",
                            foreignField: "_id",
                            as: "subscriberData",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatarURL: "$avatar.secure_url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            subscriberUsername: {
                                $arrayElemAt: ["$subscriberData.username", 0],
                            },
                            subscriberAvatarURL: {
                                $arrayElemAt: ["$subscriberData.avatarURL", 0],
                            },
                            subscribedAt: "$createdAt",
                        },
                    },
                ],
                oldest5Subscribers: [
                    {
                        $sort: { createdAt: 1 },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "subscriber",
                            foreignField: "_id",
                            as: "subscriberData",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatarURL: "$avatar.secure_url",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            subscriberUsername: {
                                $arrayElemAt: ["$subscriberData.username", 0],
                            },
                            subscriberAvatarURL: {
                                $arrayElemAt: ["$subscriberData.avatarURL", 0],
                            },
                            subscribedAt: "$createdAt",
                        },
                    },
                ],
            },
        },
        {
            $project: {
                subscriberCount: {
                    $arrayElemAt: ["$subscriberCount.subscriberCount", 0],
                },
                newest5Subscribers: 1,
                oldest5Subscribers: 1,
            },
        },
    ];
    const channelVideos = await Video.find(
        { owner: req.user?._id },
        { _id: 1 }
    );

    const channelVideoIds = channelVideos.map((vid) => vid._id);

    const playlistsHavingChannelVideos = await Playlist.countDocuments({
        videos: { $in: channelVideoIds },
    });

    const totalPlaylistsOnChannel = await Playlist.countDocuments({
        owner: req.user?._id,
    });

    const [videoStats, likeStats, commentStats, subscriptionStats] =
        await Promise.all([
            Video.aggregate(videoPipeline),
            Video.aggregate(likePipeline),
            Video.aggregate(commentPipeline),
            Subscription.aggregate(subscriptionPipeline),
        ]);

    return res.status(200).json(
        new ApiResponse(200, {
            videoStats: videoStats[0] || null,
            likeStats: likeStats[0] || null,
            commentStats: commentStats[0] || null,
            subscriptionStats: subscriptionStats[0] || null,
            playlistStats: {
                totalPlaylistsOnChannel: totalPlaylistsOnChannel,
                playlistsHavingChannelVideos: playlistsHavingChannelVideos,
            },
        })
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    let pageValue = parseInt(page);
    let limitValue = parseInt(limit);
    if (limitValue >= 1000) limitValue = 10;

    const totalChannelVideos = await Video.countDocuments({
        owner: req.user?._id,
    });
    if (!totalChannelVideos)
        throw new ApiError(404, "No videos found on channel!");

    const totalPages = Math.ceil(totalChannelVideos / limitValue);

    if (pageValue <= 0 || pageValue > totalPages) pageValue = 1;

    const channelVideos = await Video.find({ owner: req.user?._id })
        .skip((pageValue - 1) * limitValue)
        .sort({ createdAt: -1 })
        .limit(limitValue);

    const pagination = {
        totalChannelVideos: totalChannelVideos,
        currentPage: pageValue,
        limit: limitValue,
        hasPrev: pageValue > 1,
        hasNext: pageValue < totalPages,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                [channelVideos, pagination],
                "Channel videos fetched successfully"
            )
        );
});

export { getChannelStats, getChannelVideos };

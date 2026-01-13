import mongoose, { mongo } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;
    let subscriptionStatus;

    if (!channelId?.trim())
        throw new ApiError("channelId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(channelId))
        throw new ApiError("Invalid channelId passed!");

    const subscriptionDocument = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (!subscriptionDocument) {
        if (userId.equals(channelId)) {
            throw new ApiError(403, "Toggling subscription is forbidden!");
        }
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId,
        });
        subscriptionStatus = true;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { newSubscription, subscriptionStatus },
                    "Subscription toggled successfully!"
                )
            );
    } else {
        const deletedSubscription = await Subscription.findOneAndDelete({
            subscriber: userId,
            channel: channelId,
        });

        if (!deletedSubscription)
            throw new ApiError(500, "Internal Server Error!");
        subscriptionStatus = false;
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscriptionStatus: subscriptionStatus },
                    "Subscription toggled successfully!"
                )
            );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId?.trim())
        throw new ApiError("channelId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(channelId))
        throw new ApiError("Invalid channelId passed!");
    if (new mongoose.Types.ObjectId(channelId).equals(req.user?._id)) {
        const populatedChannelSubscribers = await Subscription.aggregate([
            {
                $match: { channel: new mongoose.Types.ObjectId(channelId) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriberData",
                },
            },
            {
                $unwind: "$subscriberData",
            },
            {
                $project: {
                    subscriberUsername: "$subscriberData.username",
                    subscriberAvatarURL: "$subscriberData.avatar.secure_url",
                },
            },
        ]);

        if (!populatedChannelSubscribers.length)
            throw new ApiError(404, "No subscribers found in the database!");

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    userChannelSubscribers: populatedChannelSubscribers,
                    subscriberCount: populatedChannelSubscribers.length,
                },
                "User channel subscribers fetched successfully"
            )
        );
    } else {
        const subscriberCountPipeline = await Subscription.aggregate([
            {
                $match: { channel: new mongoose.Types.ObjectId(channelId) },
            },
            {
                $count: "subscriberCount",
            },
        ]);
        console.log(subscriberCountPipeline);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        subscriberCount:
                            subscriberCountPipeline[0].subscriberCount,
                    },
                    "User channel subscribers fetched successfully"
                )
            );
    }
    // Improved logic in this commit is - if user is not the channel's owner then we will only show them the subscriberCount (no details) just matching YouTube's logic ;)
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId?.trim())
        throw new ApiError("subscriberId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(subscriberId))
        throw new ApiError("Invalid subscriberId passed!");

    if (!new mongoose.Types.ObjectId(subscriberId).equals(req.user?._id))
        throw new ApiError(403, "Viewing subscribed channels is Forbidden!");

    const populatedChannelList = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelData",
            },
        },
        {
            $unwind: "$channelData",
        },
        {
            $project: {
                channelUsername: "$channelData.username",
                channelAvatarURL: "$channelData.avatar.secure_url",
            },
        },
    ]);

    if (!populatedChannelList.length)
        throw new ApiError(404, "No subscriptions found in the database!");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                userSubscriptions: populatedChannelList,
                subscriptionsCount: populatedChannelList.length,
            },
            "User channel subscriptions fetched successfully"
        )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

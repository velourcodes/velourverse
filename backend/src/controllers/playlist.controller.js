import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Try adding playlist thumbnail too later on when project todos are done

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim() && !description?.trim())
        throw new ApiError(
            400,
            "Playlist name and description are both required fields!"
        );

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    // Add playlist public/private viewing later when everything is done
    const { userId } = req.params;
    const loggedInUserId = req.user?._id;

    if (!userId?.trim())
        throw new ApiError(400, "userId cannot be left blank!");

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!loggedInUserId.equals(userObjectId))
        throw new ApiError(403, "Viewing playlists is forbidden!");

    const populatedUserPlaylists = await Playlist.aggregate([
        {
            $match: { owner: userObjectId },
        },
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
                name: 1,
                description: 1,
                videos: 1,
                playlistVideoCount: { $size: "$videos" },
                ownerUsername: "$ownerData.username",
                ownerAvatarURL: "$ownerData.avatar.secure_url",
            },
        },
    ]);
    if (!populatedUserPlaylists.length)
        throw new ApiError(404, "No playlists found in the database!");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                playlists: populatedUserPlaylists,
                noOfPlaylists: populatedUserPlaylists.length,
            },
            "User playlists fetched successfully"
        )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId?.trim())
        throw new ApiError(400, "playlistId cannot be left blank");

    const populatedPlaylist = await Playlist.findById(playlistId)
        .populate("owner", "avatar.secure_url username")
        .populate("videos", "title thumbnail.secure_url view createdAt");

    if (!populatedPlaylist)
        throw new ApiError(404, "Playlist not found in the database!");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                populatedPlaylist,
                "Playlist fetched successfully"
            )
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user?._id;

    if (!playlistId?.trim())
        throw new ApiError(400, "playlistId cannot be left blank");

    if (!mongoose.Types.ObjectId.isValid(playlistId))
        throw new ApiError(400, "Invalid playlistId passed!");

    if (!videoId?.trim())
        throw new ApiError(400, "videoId cannot be left blank");

    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "Invalid videoId passed!");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Playlist not found in the database!");
    if (!playlist.owner.equals(userId))
        throw new ApiError(403, "Deleting the playlist is forbidden!");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found in the database!");

    await playlist.videos.push(video._id); // $push and push() are both provided by mongoose only just use case is different
    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video added to playlist successfully"
            )
        );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user?._id;

    if (!playlistId?.trim())
        throw new ApiError(400, "playlistId cannot be left blank");

    if (!mongoose.Types.ObjectId.isValid(playlistId))
        throw new ApiError(400, "Invalid playlistId passed!");

    if (!videoId?.trim())
        throw new ApiError(400, "videoId cannot be left blank");

    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "Invalid videoId passed!");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Playlist not found in the database!");
    if (!playlist.owner.equals(userId))
        throw new ApiError(403, "Removing video from playlist is forbidden!");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found in the database!");

    await playlist.videos.pull(video._id);
    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Video removed successfully from the playlist"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user?._id;

    if (!playlistId?.trim())
        throw new ApiError(400, "playlistId cannot be left blank!");

    if (!mongoose.Types.ObjectId.isValid(playlistId))
        throw new ApiError(400, "Invalid playlistId passed!");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Playlist not found in the database!");
    if (!playlist.owner.equals(userId))
        throw new ApiError(403, "Deleting the playlist is forbidden!");

    await Playlist.findOneAndDelete({ _id: playlistId, owner: userId });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const userId = req.user?._id;

    if (!playlistId?.trim())
        throw new ApiError(400, "playlistId cannot be left blank");

    if (!mongoose.Types.ObjectId.isValid(playlistId))
        throw new ApiError(400, "Invalid playlistId passed!");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Playlist not found in the database!");
    if (!playlist.owner.equals(userId))
        throw new ApiError(403, "Updating the playlist is forbidden!");

    let updateFields = new Object();

    if (name?.trim() && description?.trim()) {
        updateFields.name = name;
        updateFields.description = description;
    } else if (name?.trim()) updateFields.name = name;
    else if (description?.trim()) updateFields.description = description;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "At least one field is required...");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateFields,
        },
        { new: true }
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};

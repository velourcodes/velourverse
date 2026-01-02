import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Video } from "./video.model.js";
import { ApiError } from "../utils/ApiError.js";
const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

commentSchema.pre("save", async function () {
    const video = await Video.findById(this.video);
    //     await newComment.save();
    // Mongoose calls your pre("save") hook
    //  Inside the hook, `this` = the comment document being saved
    // `this.video` = "video123" (the value ObjectId you just set!)
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }
    
    if (!video.isPublished) {
        throw new ApiError(403, "Commenting on unpublished video is not allowed!");
    }
});
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);

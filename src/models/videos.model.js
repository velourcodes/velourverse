import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title cannot be left blank!"],
            index: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        videoFile: {
            type: String,
            required: true,
        },
        owner: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: [
                true,
                "Duration is a mandatory field to proceed further!",
            ],
        },
        views: {
            type: Number,
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

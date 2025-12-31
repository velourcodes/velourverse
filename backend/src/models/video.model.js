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
            secure_url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        videoFile: {
            secure_url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        owner: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

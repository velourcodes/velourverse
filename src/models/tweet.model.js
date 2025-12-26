import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            required: [true, "Tweet cannot be published blank!"],
        },
    },
    {
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    },
    { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);

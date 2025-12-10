import mongoose from "mongoose";
const subscriptionsSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    },
    { timestamps: true }
);

export const Subsciption = mongoose.model("Subscription", subscriptionsSchema);

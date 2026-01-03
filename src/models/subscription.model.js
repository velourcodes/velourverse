import mongoose from "mongoose";
import { User } from "./user.model.js";
const subscriptionSchema = new mongoose.Schema(
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
    { timestamps: true }
);

subscriptionSchema.pre("save", async function () {
    const isSubscriberValid = await User.findById(this.subscriber);
    const isChannelValid = await User.findById(this.channel);
    console.log("Subscriber User Doc: ", isSubscriberValid);
    console.log("Channel User Doc: ", isChannelValid);
    
    if (!isSubscriberValid && !isChannelValid)
        throw new Error("Channel or User is not registred in the database!");
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

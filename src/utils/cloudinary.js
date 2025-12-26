import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_SECRET,
    api_secret: process.env.CLOUDINARY_API_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath);
        fs.unlinkSync(localFilePath);

        console.log(response);

        return {
            secure_url: response.secure_url,
            public_id: response.public_id,
        };
    } catch (error) {
        console.log(error.message);
        fs.unlinkSync(localFilePath);
    }
};

const deleteFromCloudinary = async (publicID) => {
    if (!publicID?.trim()) throw new ApiError(400, "Invalid public_id");

    try {
        const deletionResult = await cloudinary.uploader.destroy(publicID);
        console.log("Deletion result:", deletionResult);

        if (deletionResult.result === "not found") {
            console.log(
                `Resource ${publicID} not found on Cloudinary, continuing...`
            );
            return deletionResult;
        } else if (!(deletionResult.result === "ok")) {
            throw new ApiError(502, "Old resource deletion failed!");
        }

        return deletionResult;
    } catch (error) {
        console.error("Cloudinary API error:", error.message);
        throw new ApiError(502, "Cloudinary service unavailable");
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };

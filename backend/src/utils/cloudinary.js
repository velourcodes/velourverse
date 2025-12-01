import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

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

        return response.secure_url;
    } catch (error) {
        console.log(error.message);
        fs.unlinkSync(localFilePath);
    }
};

export { uploadOnCloudinary };

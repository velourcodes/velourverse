import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("Error: User provided empty path!");
        else if (!fs.existsSync(localFilePath))
            throw new Error(`File does not exist: ${localFilePath}`);
        else {
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            });
            console.log(
                "File has been successfully uploaded on Cloudinary",
                response.url
            );
            return response;
        }
    } catch (error) {
        // Delete the file from local server if file exists and upload fails, then return null
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
const options = {
    httpOnly: true,
    secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body;
    console.log(`Username: ${username}\nFull Name: ${fullName}`);

    if (
        [username, email, fullName, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are mandatory");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser)
        throw new ApiError(
            409,
            "A user with the following email or username already exists!"
        );
    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required!");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);
    console.log(coverImage);

    if (!avatar) throw new ApiError(400, "Avatar file is required!");

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar,
        coverImage: coverImage || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser)
        throw new ApiError(
            500,
            "Something went wrong during registering new user!"
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                createdUser,
                "New user registered successfully!"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // fetch user details - username password
    // if username - password dont match disallow
    // if username does not exist in the database, redirect to register route
    // if username exists, and password matches (by compare of bcrypt), login user and pass tokens via cookies
    // return the response for login success

    const { username, email, password } = req.body;
    if (!username && !email)
        throw new ApiError(
            400,
            "User is required to provide either username or email for login"
        );

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) throw new ApiError(404, "User not found!");

    if (!password || password.trim() === "")
        throw (400, "Password is required");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (isPasswordValid) {
        const accessToken = await user.generateAccessToken();

        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken, // Sending cookies to req.body for mobile users
                    },
                    "User logged in successfully"
                )
            );
    } else throw new ApiError(401, `Invalid Password for user - ${username}`);
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(204, {}, "User was logged out successfully! "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    // For mobile users req.body is non existent

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request"); // If token is not in correct format/ empty

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) throw new ApiError(401, "Invalid Refresh Token!"); // User not valid or no user found

    console.log("Decoded Refresh Token: ", decodedToken);
    if (!(incomingRefreshToken === user.refreshToken))
        throw new ApiError(401, "Refresh Token Expired!");
    // Expired Token - Even if user is valid, refresh and login not allowed anymore

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    console.log("Before Refreshing: ", incomingRefreshToken);
    console.log("After Refreshing: ", refreshToken);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access Token Refreshed Successfully"
            )
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    // Middleware already checks for login! :D
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id); // auth middelware has the user already saved in body
    const isPasswordCorrect = await user.isPasswordCorrect();
    if (isPasswordCorrect) {
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(
                new ApiResponse(204, null, "Passsword was updated successfully")
            );
    } else throw new ApiError(401, "Password updation failed!");
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    if (!currentUser) throw new ApiError(404, "User not found");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                currentUser,
                "Returned current user successfully"
            )
        );
});
const updateUserDetails = asyncHandler(async (req, res) => {
    const { username, email, fullName } = req.body;

    if (!username && !email && !fullName)
        throw new ApiError(400, "Atleast one field is required!");

    const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                username: username,
                email: email,
                fullName: fullName,
            },
        },
        { new: true } // Returns updated user document
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "User info updated sucessfully")
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateUserDetails,
};

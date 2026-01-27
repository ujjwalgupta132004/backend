import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";

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
    
    
    const { fullName, email, username, password } = req.body
    console.log("email: ", email);
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required")
    }
    const existingUser = User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with given email/username already exists")
    }
    const avatarlocalPath = req.files?.avatar?.[0]?.path;
    const coverImagelocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarlocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarlocalPath);
    const coverImage = await uploadOnCloudinary(coverImagelocalPath) ;
    if (!avatar) {
        throw new ApiError(400, "Could not upload avatar image, please try again")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        username : username.toLowerCase(),
        password
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken -__v")
    if (!createdUser) {
        throw new ApiError(500, "User registration failed, please try again")
    }
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser))
})

export { registerUser }

   
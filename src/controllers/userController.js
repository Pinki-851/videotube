import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const userRegistration = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  if (
    [username, email, fullname, password]?.some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    throw new ApiError(409, "User alreay exit with the same username or email");
  }
  const avatarLoaclPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLoaclPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLoaclPath);
  const cover = await uploadOnCloudinary(coverLocalPath);
  console.log("controller-avatar", avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    username,
    fullname,
    email,
    password,
    avatar: avatar?.url,
    coverImage: cover ? cover?.url : "",
  });

  const createdUser = await User.findOne(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "internal server error");
  }

  return res
    .status(201)
    .json(new APIResponse(200, createdUser, "user registered successfully"));
});

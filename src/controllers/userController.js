import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// cookie option
const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (userID) => {
  try {
    console.log("userid", userID);
    const user = await User.findById(userID);
    // console.log("user", user);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Somethin went wrong while creating Access token and refresh token"
    );
  }
};

const userRegistration = asyncHandler(async (req, res) => {
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const validPass = await user.isPasswordCorrect(password);
  if (!validPass) {
    throw new ApiError(400, "invalid credential");
  }

  // if username and password is correct povid token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user?._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        { user: loggedInUser, accessToken },
        "User loggedin successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  // cookie option
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req?.cookies.refreshToken || req?.body?.token;
  if (!token) {
    throw new ApiError(400, "token is required");
  }

  const decodeToken = await jwt.verify(
    token,
    process.env.REFERESH_TOKEN_SECRET
  );

  const user = await User.findById(decodeToken?._id);

  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }
  if (user?.refreshToken !== token) {
    throw new ApiError(400, "Token is already in used");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        200,
        { accessToken, refreshToken },
        "Token updated successfully"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!(oldpassword && newpassword)) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findById(req?.user?._id);

  if (!user) {
    throw new ApiError(400, "No such user found");
  }
  const validatePassWord = await user.isPasswordCorrect(oldpassword);
  if (!validatePassWord) {
    throw new ApiError(400, "please enter correct old password");
  }
  user.password = newpassword;
  console.log("user", user);
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Password updated successfully"));
});

const getCurrentUserDetail = asyncHandler(async (req, res) => {
  const detail = await User.findById(req?.user?._id).select("-password");
  const adetail = await User.find().select("-password");
  return res.status(200).json(new APIResponse(200, detail, "user detail"));
});

const updateUserDetail = asyncHandler(async (req, res) => {
  const { fullname, email, username } = req?.body;

  if (!fullname || !email || !username) {
    throw new ApiError(400, "Fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    { $set: { fullname, email, username } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new APIResponse(200, user, "Updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLoaclPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLoaclPath && !coverLocalPath) {
    throw new ApiError(400, "avatar or coverImage is required");
  }
  let finalAvatar, finalCoverImage;
  if (avatarLoaclPath) {
    finalAvatar = await uploadOnCloudinary(avatarLoaclPath);
  }
  if (coverLocalPath) {
    finalCoverImage = await uploadOnCloudinary(coverLocalPath);
  }
  const user = await User.findById(req?.user?._id).select("-password");
  if (!user) {
    throw new ApiError(400, "no such user found");
  }

  if (finalAvatar) {
    user.avatar = finalAvatar.url;
  }
  if (finalCoverImage) {
    user.coverImage = finalCoverImage.url;
  }
  await user.save();
  return res
    .status(200)
    .json(new APIResponse("200", user, "image updated successfully"));
});

export {
  changePassword,
  getCurrentUserDetail,
  loginUser,
  logout,
  refreshToken,
  updateAvatar,
  updateUserDetail,
  userRegistration,
};

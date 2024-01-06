import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: true,
      index: true,
    },
    fullname: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
      // required: true,
    },
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const bcryptpass = await bcrypt.hash(this.password, 10);
  this.password = bcryptpass;
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  console.log(
    "generate",
    this.email,
    process.env.TOKEN_SECRET,
    this.fullname
    // jwt.sign(
    //   {
    //     _id: this._id,
    //     email: this.email,
    //     username: this.username,
    //     fullname: this.fullname,
    //   },
    //   process.env.TOKAN_SECRET,
    //   { expiresIn: process.env.TOKAN_EXPIRY }
    // )
  );
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFERESH_TOKEN_SECRET,
    { expiresIn: process.env.REFERESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);

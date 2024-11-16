import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: [150, "Username cannot exceed 150 characters."],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: [300, "Email cannot exceed 150 characters."],
    },
    password: {
      type: String,
      required: true,
      maxlength: [300, "Username cannot exceed 150 characters."],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: [250, "Bio cannot exceed 250 characters."],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

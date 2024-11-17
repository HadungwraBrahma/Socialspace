import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../model/post.model.js";
import { getReciverSocketId, io } from "../socket/socket.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(401).json({
        message: "All fields are required.",
        success: false,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User already exists on this email ID.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email, user not found!",
        success: false,
      });
    }
    const isPassowrdMatch = await bcrypt.compare(password, user.password);
    if (!isPassowrdMatch) {
      return res.status(401).json({
        message: "Incorrect Password!",
        success: false,
      });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post?.author?.equals(user._id)) {
          return post;
        }
        return null;
      })
    );

    let { password: pass, ...userWithoutPassword } = user.toObject(); //different from original
    userWithoutPassword = { ...userWithoutPassword, posts: populatedPosts };

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: userWithoutPassword,
      });
  } catch (err) {
    console.log(err);
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out succesfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", options: { sort: { createdAt: -1 } } })
      .populate("bookmarks");

    let { password: pass, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      user: userWithoutPassword,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message: "Profile updated.",
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (err) {
    console.log(err);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const currentUserId = req.id; // the person who is going to follow/unfollow
    const targetUserId = req.params.id; // the person being followed/unfollowed

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    const timestamp = new Date();

    if (isFollowing) {
      // Unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $pull: { following: targetUserId } }
        ),
        User.updateOne(
          { _id: targetUserId },
          { $pull: { followers: currentUserId } }
        ),
      ]);

      // Send unfollow notification
      const notification = {
        type: "unfollow",
        userId: currentUserId,
        userDetails: {
          username: currentUser.username,
          profilePicture: currentUser.profilePicture,
        },
        message: `${currentUser.username} unfollowed you`,
        timestamp,
      };

      const targetUserSocketId = getReciverSocketId(targetUserId);
      if (targetUserSocketId) {
        io.to(targetUserSocketId).emit("notification:follow", notification);
      }

      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } else {
      // Follow logic
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $push: { following: targetUserId } }
        ),
        User.updateOne(
          { _id: targetUserId },
          { $push: { followers: currentUserId } }
        ),
      ]);

      // Send follow notification
      const notification = {
        type: "follow",
        userId: currentUserId,
        userDetails: {
          username: currentUser.username,
          profilePicture: currentUser.profilePicture,
        },
        message: `${currentUser.username} started following you`,
        timestamp,
      };

      const targetUserSocketId = getReciverSocketId(targetUserId);
      if (targetUserSocketId) {
        io.to(targetUserSocketId).emit("notification:follow", notification);
      }

      return res
        .status(200)
        .json({ message: "Followed successfully", success: true });
    }
  } catch (err) {
    console.log(err);
  }
};

export const searchProfile = async (req, res) => {
  try {
    const query = req.query.q;
    const profiles = await User.find({
      username: { $regex: query, $options: "i" },
    }).limit(40);

    if (!profiles) {
      return res.status(400).json({
        message: "Profile not found!",
      });
    }

    return res.status(200).json({
      success: true,
      profiles,
    });
  } catch (err) {
    console.log(err);
  }
};

import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../model/post.model.js";
import { User } from "../model/user.model.js";
import { Comment } from "../model/comment.model.js";
import { getReciverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({ message: "Image required" });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 }, // Sort comments by creation date in descending order
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    return res.status(200).json({
      post,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

/* export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
      console.log("Hello", posts)
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
}; */

export const likePost = async (req, res) => {
  try {
    const currentUserId = req.id; // the person who is going to like the post
    const postId = req.params.id; // the id of a target post

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }
    await post.updateOne({ $addToSet: { likes: currentUserId } });
    await post.save();

    const user = await User.findById(currentUserId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();
    const timestamp = new Date();

    if (postOwnerId !== currentUserId) {
      const notification = {
        type: "like",
        userId: currentUserId,
        userDetails: user,
        postId,
        message: "Your post was liked",
        timestamp,
      };
      const postOwnerSocketId = getReciverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification:like", notification);
    }

    return res.status(200).json({ message: "Post liked", success: true });
  } catch (err) {
    console.log(err);
  }
};

export const dislikePost = async (req, res) => {
  try {
    const currentUserId = req.id; // the person who is going to dislike the post
    const postId = req.params.id; // the id of a target post

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }
    await post.updateOne({ $pull: { likes: currentUserId } });
    await post.save();

    const user = await User.findById(currentUserId).select(
      "username profilePicture"
    );
    const postOwnerId = post.author.toString();
    const timestamp = new Date();

    if (postOwnerId !== currentUserId) {
      const notification = {
        type: "dislike",
        userId: currentUserId,
        userDetails: user,
        postId,
        message: "Your post was disliked",
        timestamp,
      };
      const postOwnerSocketId = getReciverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification:like", notification);
    }

    return res.status(200).json({ message: "Post disliked", success: true });
  } catch (err) {
    console.log(err);
  }
};

export const addComment = async (req, res) => {
  try {
    const currentUserId = req.id;
    const postId = req.params.id;

    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!text) {
      return res
        .status(400)
        .json({ message: "Comment can't be empty", success: false });
    }

    const comment = await Comment.create({
      text,
      author: currentUserId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    const postOwnerId = post.author.toString();
    const timestamp = new Date();

    if (postOwnerId !== currentUserId) {
      const notification = {
        type: "comment",
        userId: currentUserId,
        userDetails: comment.author,
        postId,
        message: "Someone commented on your post",
        commentId: comment._id,
        commentText: comment.text,
        timestamp,
      };
      const postOwnerSocketId = getReciverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification:comment", notification);
    }

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username, profilePicture"
    );

    if (!comments) {
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });
    }
    return res.status(200).json({ success: true, comments });
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: fasle });
    }

    if (post.author.toString() !== authorId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);

    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.log(err);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked",
        success: true,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const authorId = req.id; // The person trying to delete the comment (current user)

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Comment not found", success: false });
    }

    // Check if the user is the author of the comment or the post owner
    if (comment.author.toString() !== authorId) {
      const post = await Post.findById(postId);
      if (post.author.toString() !== authorId) {
        return res
          .status(403)
          .json({ message: "Unauthorized", success: false });
      }
    }

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
    });

    await comment.deleteOne();

    return res.status(200).json({
      message: "Comment deleted successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

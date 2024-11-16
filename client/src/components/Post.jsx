import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPost, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { setAuthUser } from "@/redux/authSlice";
import CommentDialog from "./CommentDialog";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false); // State to control the comment dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(
    user.following.includes(post?.author?._id) || false
  );

  const [isPostNewCommentloading, setIsPostNewCommentLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  useEffect(() => {
    setBookmarked(user?.bookmarks?.includes(post?._id) || false);
  }, [user, post]);

  // trim comment
  const changeEventHandler = (e) => {
    setText(e.target.value.trim() ? e.target.value : "");
  };

  const likeOrDislikeHandler = async () => {
    const originalLiked = liked;
    const originalPostLike = postLike;
    const updatedLikes = liked ? postLike - 1 : postLike + 1;

    setLiked(!liked);
    setPostLike(updatedLikes);

    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `https://socialspace-server.onrender.com/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPost(updatedPostData));
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setLiked(originalLiked);
      setPostLike(originalPostLike);
      toast.error("Failed to update like status.");
    }
  };

  const commentHandler = async () => {
    if (isPostNewCommentloading) return;

    setIsPostNewCommentLoading(true);

    try {
      const res = await axios.post(
        `https://socialspace-server.onrender.com/api/v1/post/${post?._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPost(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment.");
    } finally {
      setIsPostNewCommentLoading(false);
    }
  };

  const deletePostHandler = async () => {
    const originalPosts = [...posts];

    const updatedPostData = posts.filter((p) => p?._id !== post?._id);
    dispatch(setPost(updatedPostData));

    try {
      const res = await axios.delete(
        `https://socialspace-server.onrender.com/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      dispatch(setPost(originalPosts));
      toast.error("Failed to delete the post. Please try again.");
    }
  };

  const bookmarkHandler = async () => {
    const wasBookmarked = bookmarked;
    setBookmarked(!bookmarked);

    const updatedBookmarks = wasBookmarked
      ? user.bookmarks.filter((id) => id !== post._id)
      : [...user.bookmarks, post._id];
    dispatch(setAuthUser({ ...user, bookmarks: updatedBookmarks }));

    try {
      const res = await axios.get(
        `https://socialspace-server.onrender.com/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        // toast.success(res.data.message);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error(err);

      setBookmarked(wasBookmarked);

      const rollbackBookmarks = wasBookmarked
        ? [...user.bookmarks, post._id]
        : user.bookmarks.filter((id) => id !== post._id);
      dispatch(setAuthUser({ ...user, bookmarks: rollbackBookmarks }));

      toast.error("Failed to update bookmark. Please try again.");
    }
  };

  const followUnfollowHandler = async () => {
    if (isFollowingLoading) return;

    setIsFollowingLoading(true);

    try {
      const res = await axios.post(
        `https://socialspace-server.onrender.com/api/v1/user/followorunfollow/${post?.author?._id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);

        const updatedFollowing = following
          ? user.following.filter((id) => id !== post?.author?._id)
          : [...user.following, post?.author?._id];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
        setFollowing(!following);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const postUrl = `${window.location.origin}/post/${post._id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${post?.author?._id}`}>
            <Avatar>
              <AvatarImage
                src={post.author?.profilePicture}
                alt="profile_pic"
              />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post?.author?._id}`}>
              <h1>{post.author?.username}</h1>
            </Link>
            {user._id === post.author._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {user && user._id !== post?.author?._id && (
              <Button
                onClick={followUnfollowHandler}
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
                disabled={isFollowingLoading}
              >
                {isFollowingLoading
                  ? following
                    ? "Unfollowing..."
                    : "Following..."
                  : following
                  ? "Unfollow"
                  : "Follow"}
              </Button>
            )}
            {user && user._id === post?.author?._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Link to={`/post/${post._id}`}>
        <img
          className="rounded-sm my-2 w-full object-cover"
          src={post.image}
          alt="post_image"
          onClick={() => dispatch(setSelectedPost(post))}
        />
      </Link>
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={"22px"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true); // Open the comment dialog
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Send
                onClick={() => setShowShareDialog(true)}
                className="cursor-pointer hover:text-gray-600"
              />
            </DialogTrigger>
            <DialogContent className="text-sm text-center">
              <p className="mb-2">Share this post:</p>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  className="w-full p-2 border rounded-sm"
                  value={postUrl}
                  readOnly
                />
                <Button
                  onClick={copyToClipboard}
                  variant="ghost"
                  className="ml-2"
                >
                  Copy Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {bookmarked ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        )}
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p className="break-words">
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="text-gray-400 cursor-pointer"
        >
          View all {comment.length} comments
        </span>
      )}
      <div className="flex mt-4 gap-2 w-full justify-between">
        <textarea
          rows="1"
          className="w-full p-2 rounded-sm"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
        />
        <Button
          variant="outline"
          disabled={isPostNewCommentloading || !text.trim()}
          onClick={commentHandler}
        >
          {isPostNewCommentloading ? "Posting..." : "Post"}
        </Button>
      </div>
      <CommentDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Post;

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, BookmarkCheck, MessageCircle, MoreHorizontal, Send } from "lucide-react";
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

  useEffect(() => {
    setBookmarked(user?.bookmarks?.includes(post?._id) || false);
  }, [user, post]);

  // trim comment
  const changeEventHandler = (e) => {
    setText(e.target.value.trim() ? e.target.value : "");
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

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
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post?._id}/comment`,
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
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter((p) => p?._id !== post?._id);
        dispatch(setPost(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setBookmarked(!bookmarked);

        const updatedBookmarks = bookmarked
          ? user.bookmarks.filter((id) => id !== post._id)
          : [...user.bookmarks, post._id];

        dispatch(setAuthUser({ ...user, bookmarks: updatedBookmarks }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const followUnfollowHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${post?.author?._id}`,
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
              <AvatarImage src={post.author?.profilePicture} alt="profile_pic" />
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
              >
                {following ? "Unfollow" : "Follow"}
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
                <Button onClick={copyToClipboard} variant="ghost" className="ml-2">
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
      <div className="flex items-center justify-between mt-4">
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full text-sm outline-none"
          value={text}
          onChange={changeEventHandler}
        />
        <button
          disabled={!text}
          className={`${
            text ? "text-[#ED4956]" : "text-gray-300"
          } text-sm font-bold ml-2`}
          onClick={commentHandler}
        >
          Post
        </button>
      </div>
      <CommentDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Post;

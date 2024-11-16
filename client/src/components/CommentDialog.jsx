import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axiosInstance from "@/axiosInstance";
import { toast } from "sonner";
import { setPost } from "@/redux/postSlice";
import { setAuthUser } from "@/redux/authSlice";

const CommentDialog = ({ open, setOpen }) => {
  const { selectedPost, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [comment, setComment] = useState([]);
  const [text, setText] = useState("");
  const commentEndRef = useRef(null);
  const [following, setFollowing] = useState(
    user?.following.includes(selectedPost?.author?._id) || false
  );
  const [isPostNewCommentloading, setIsPostNewCommentLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false); // New state

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (commentEndRef.current) {
      commentEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comment]);

  // trim comment
  const changeEventHandler = (e) => {
    setText(e.target.value.trim() ? e.target.value : "");
  };

  const commentHandler = async () => {
    try {
      setIsPostNewCommentLoading(true);
      const res = await axiosInstance.post(
        `/api/v1/post/${selectedPost?._id}/comment`,
        { text }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );

        dispatch(setPost(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to post comment.");
    } finally {
      setIsPostNewCommentLoading(false);
    }
  };

  const deleteCommentHandler = async (commentId) => {
    const deletedComment = comment.find((com) => com._id === commentId);

    try {
      const updatedCommentData = comment.filter((com) => com._id !== commentId);
      setComment(updatedCommentData);

      const updatedPostData = posts.map((p) =>
        p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
      );
      dispatch(setPost(updatedPostData));

      const res = await axiosInstance.delete(
        `/api/v1/post/${selectedPost?._id}/comment/${commentId}`
      );

      if (!res.data.success) {
        throw new Error("Failed to delete the comment");
      }

      // toast.success("Comment deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete the comment. Restoring...");

      setComment([...comment, deletedComment]);

      const updatedPostData = posts.map((p) =>
        p._id === selectedPost._id
          ? { ...p, comments: [...p.comments, deletedComment] }
          : p
      );
      dispatch(setPost(updatedPostData));
    }
  };

  const followUnfollowHandler = async () => {
    setIsFollowLoading(true);
    try {
      const res = await axiosInstance.post(
        `/api/v1/user/followorunfollow/${selectedPost?.author?._id}`,
        {}
      );
      if (res.data.success) {
        toast.success(res.data.message);

        const updatedFollowing = following
          ? user.following.filter((id) => id !== selectedPost?.author?._id)
          : [...user.following, selectedPost?.author?._id];

        dispatch(setAuthUser({ ...user, following: updatedFollowing }));
        setFollowing(!following);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl w-full sm:max-w-4xl sm:w-[600px] h-auto max-h-[70vh] flex flex-col sm:flex-row p-0 overflow-hidden"
      >
        {/* Image Section */}
        <div className="w-full sm:w-1/2">
          <img
            src={selectedPost?.image}
            alt="post_img"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Comments Section */}
        <div className="w-full sm:w-1/2 flex flex-col h-full max-h-[70vh] overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${selectedPost?.author?._id}`}>
                <Avatar>
                  <AvatarImage src={selectedPost?.author?.profilePicture} />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={`/profile/${selectedPost?.author?._id}`}
                  className="font-semibold text-sm"
                >
                  {selectedPost?.author?.username}
                </Link>
              </div>
            </div>
            {user._id !== selectedPost?.author?._id && (
              <Button
                onClick={followUnfollowHandler}
                variant="ghost"
                className="text-[#ED4956] font-bold"
                disabled={isFollowLoading}
              >
                {isFollowLoading
                  ? following
                    ? "Unfollowing..."
                    : "Following..."
                  : following
                  ? "Unfollow"
                  : "Follow"}
              </Button>
            )}
          </div>
          <hr />
          <div className="flex-1 overflow-y-auto p-4">
            {comment.map((com) => (
              <div key={com._id} className="flex items-start gap-4 relative">
                <Comment comment={com} />
                {user._id === com.author._id && (
                  <button
                    onClick={() => deleteCommentHandler(com._id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white hover:bg-red-600 rounded-full px-2 py-1 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <div ref={commentEndRef} />
          </div>
          <div className="p-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="w-full outline-none border border-gray-300 p-2 rounded"
              onChange={changeEventHandler}
              value={text}
            />
            <Button
              disabled={!text.trim() || isPostNewCommentloading}
              onClick={commentHandler}
              variant="outline"
            >
              {isPostNewCommentloading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;

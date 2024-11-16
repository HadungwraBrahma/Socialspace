import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
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

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        { withCredentials: true }
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
    }
  };

  const deleteCommentHandler = async (commentId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/${selectedPost?._id}/comment/${commentId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedCommentData = comment.filter(
          (com) => com._id !== commentId
        );
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );

        dispatch(setPost(updatedPostData));
        toast.success("Comment deleted successfully!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete the comment.");
    }
  };

  const followUnfollowHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${selectedPost?.author?._id}`,
        {},
        { withCredentials: true }
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
              >
                {following ? "Unfollow" : "Follow"}
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
              disabled={!text.trim()}
              onClick={sendMessageHandler}
              variant="outline"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;

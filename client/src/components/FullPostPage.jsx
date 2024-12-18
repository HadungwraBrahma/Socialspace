import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Bookmark, BookmarkCheck, Send } from "lucide-react";
import axiosInstance from "@/axiosInstance";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "@/redux/postSlice";
import { setAuthUser } from "@/redux/authSlice";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import FullPostPageSkeleton from "@/skeletons/FullPostPageSkeleton";
import Comment from "./Comment";

const FullPostPage = () => {
  const { postId } = useParams();
  const [text, setText] = useState("");
  const [post, setPostDetails] = useState(null);
  const [liked, setLiked] = useState(false);
  const [postLike, setPostLike] = useState(0);
  const [comments, setComments] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const [visibleComments, setVisibleComments] = useState(3);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/post/${postId}`);
        const fetchedPost = res.data.post;

        setPostDetails(fetchedPost);
        setLiked(fetchedPost.likes.includes(user?._id));
        setPostLike(fetchedPost.likes.length);
        setComments(fetchedPost.comments);
        setBookmarked(user?.bookmarks?.includes(postId) || false);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching post details.");
      }
    };

    if (user) {
      fetchPostDetails();
    }
  }, [postId, user]);

  const likeOrDislikeHandler = async () => {
    const originalLiked = liked;
    const originalPostLike = postLike;

    const updatedLikes = liked ? postLike - 1 : postLike + 1;
    setLiked(!liked);
    setPostLike(updatedLikes);

    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.get(`/api/v1/post/${postId}/${action}`);

      if (res.data.success) {
        const updatedPostData = posts.map((p) =>
          p?._id === post?._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user?._id)
                  : [...p.likes, user?._id],
              }
            : p
        );
        dispatch(setPost(updatedPostData));
      } else {
        setLiked(originalLiked);
        setPostLike(originalPostLike);
        toast.error("Error updating like status.");
      }
    } catch (err) {
      console.error(err);
      setLiked(originalLiked);
      setPostLike(originalPostLike);
      toast.error("Error updating like status.");
    }
  };

  const bookmarkHandler = async () => {
    const wasBookmarked = bookmarked;
    setBookmarked(!bookmarked);

    const updatedBookmarks = wasBookmarked
      ? user?.bookmarks?.filter((id) => id !== postId)
      : [...user.bookmarks, postId];
    dispatch(setAuthUser({ ...user, bookmarks: updatedBookmarks }));

    try {
      const res = await axiosInstance.get(`/api/v1/post/${postId}/bookmark`);

      if (res.data.success) {
        // toast.success(res.data.message);
      } else {
        throw new Error("Failed to update bookmark.");
      }
    } catch (err) {
      console.error(err);

      setBookmarked(wasBookmarked);

      const rollbackBookmarks = wasBookmarked
        ? [...user.bookmarks, postId]
        : user?.bookmarks?.filter((id) => id !== postId);
      dispatch(setAuthUser({ ...user, bookmarks: rollbackBookmarks }));

      toast.error("Failed to update bookmark. Please try again.");
    }
  };

  const commentHandler = async () => {
    if (!text.trim()) return;

    const newComment = {
      _id: Date.now(), // Temporary ID for the optimistic update
      text: text,
      author: {
        _id: user?._id,
        username: user?.username,
        profilePicture: user?.profilePicture,
      },
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    setText("");

    try {
      const res = await axiosInstance.post(`/api/v1/post/${postId}/comment`, {
        text,
      });

      if (res.data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment?._id === newComment?._id ? res.data.comment : comment
          )
        );

        const updatedPostData = posts.map((p) =>
          p?._id === post?._id
            ? {
                ...p,
                comments: [res.data.comment, ...comments],
              }
            : p
        );
        dispatch(setPost(updatedPostData));
      } else {
        throw new Error("Failed to post comment.");
      }
    } catch (err) {
      console.error(err);
      setComments((prev) =>
        prev.filter((comment) => comment?._id !== newComment?._id)
      );
      toast.error("Failed to post comment. Please try again.");
    }
  };

  const showMoreComments = () => {
    setVisibleComments((prev) => prev + 3);
  };

  const showFewerComments = () => {
    setVisibleComments((prev) => Math.max(prev - 3, 3));
  };

  const deleteCommentHandler = async (commentId) => {
    const originalComments = [...comments];

    const updatedComments = comments.filter(
      (comment) => comment?._id !== commentId
    );

    setComments(updatedComments);

    const updatedPostData = posts.map((p) =>
      p?._id === post?._id ? { ...p, comments: [...updatedComments] } : p
    );

    dispatch(setPost(updatedPostData));

    try {
      const res = await axiosInstance.delete(
        `/api/v1/post/${postId}/comment/${commentId}`
      );

      if (res.data.success) {
        // toast.success(res.data.message);
      } else {
        throw new Error("Failed to delete comment.");
      }
    } catch (err) {
      console.error(err);
      setComments(originalComments);

      const rollbackPostData = posts.map((p) =>
        p?._id === post?._id ? { ...p, comments: [...originalComments] } : p
      );
      dispatch(setPost(rollbackPostData));

      toast.error("Error deleting comment. Please try again.");
    }
  };

  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const postUrl = window.location.href;

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  useEffect(() => {
    window.scrollTo(0, 0); // scroll to the top
  }, [postId]);

  if (!post) return <FullPostPageSkeleton />;

  return (
    <div className="my-8 w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post?.author?._id}`}>
            <Avatar>
              <AvatarImage
                src={post?.author?.profilePicture}
                alt="User Profile"
              />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${post?.author?._id}`}>
              <h1 className="font-semibold">{post?.author?.username}</h1>
            </Link>
            {user?._id === post?.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        {bookmarked ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-800"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-800"
          />
        )}
      </div>

      <img
        src={post?.image}
        alt="Post"
        className="rounded-lg my-4 w-full h-auto object-cover"
      />

      <p className="font-semibold">{postLike} likes</p>
      <p className="mb-4 break-words">
        <span className="font-semibold">{post?.author?.username}</span>{" "}
        {post?.caption}
      </p>

      <div className="flex items-center gap-6 mb-4">
        {liked ? (
          <FaHeart
            onClick={likeOrDislikeHandler}
            size={24}
            className="cursor-pointer text-red-500"
          />
        ) : (
          <FaRegHeart
            onClick={likeOrDislikeHandler}
            size={24}
            className="cursor-pointer hover:text-gray-600"
          />
        )}

        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <Send
              onClick={() => setShowShareDialog(true)}
              className="cursor-pointer hover:text-gray-600"
            />
          </DialogTrigger>
          <DialogContent>
            <div className="p-4 space-y-4">
              <h3 className="text-xl font-semibold">Share Post</h3>
              <p className="text-gray-600">
                Copy the link to share the post with others.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={postUrl}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => copyToClipboard(postUrl)}
                  className="ml-2 text-blue-500"
                >
                  Copy
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 mt-4 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-blue-500 cursor-pointer font-semibold"
          >
            Post
          </span>
        )}
      </div>

      <div className="space-y-4">
        {sortedComments.slice(0, visibleComments).map((comment, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 border-t border-gray-200 relative"
          >
            <Comment key={idx} comment={comment} />
            {(comment?.author?._id === user?._id ||
              post?.author?._id === user?._id) && (
              <button
                onClick={() => deleteCommentHandler(comment?._id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white hover:bg-red-600 rounded-full px-2 py-1 text-xs transition duration-200"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {visibleComments < sortedComments?.length && (
        <button
          onClick={showMoreComments}
          className="text-blue-500 hover:underline mt-4 mr-4"
        >
          Show more comments
        </button>
      )}
      {visibleComments > 3 && (
        <button
          onClick={showFewerComments}
          className="text-blue-500 hover:underline mt-4"
        >
          Show fewer comments
        </button>
      )}
    </div>
  );
};

export default FullPostPage;

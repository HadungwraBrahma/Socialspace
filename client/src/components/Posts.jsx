import React from "react";
import Post from "./Post";
import PostSkeleton from "@/skeletons/PostSkeleton.jsx";
import { useSelector } from "react-redux";

const Posts = () => {
  const { posts, isPostLoading } = useSelector((store) => store.post);
  const isPost = true;
  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {isPostLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))
        : posts.map((post) => <Post key={post._id} post={post} />)}
    </div>
  );
};

export default Posts;

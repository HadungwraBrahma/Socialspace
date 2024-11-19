import React from "react";

const PostSkeleton = () => {
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 animate-pulse">
        <div className="w-72 lg:w-96 flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <div className="flex flex-col">
            <div className="w-24 h-4 bg-gray-300 rounded-sm" />
            <div className="w-16 h-4 bg-gray-300 rounded-sm mt-1" />
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded-full" />
      </div>

      {/* Post Image */}
      <div className="w-full h-64 bg-gray-300 rounded-sm mb-4 animate-pulse" />

      {/* Actions */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded-full" />
      </div>

      {/* Comments */}
      <div className="w-32 h-4 bg-gray-300 rounded-sm mb-4" />

      {/* Comment Input */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-300 rounded-sm" />
        <div className="w-20 h-10 bg-gray-300 rounded-sm" />
      </div>
    </div>
  );
};

export default PostSkeleton;

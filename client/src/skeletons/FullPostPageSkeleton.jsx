import React from "react";

const FullPostPageSkeleton = () => {
    return (
      <div className="my-8 w-full max-w-3xl mx-auto px-4 min-h-screen flex flex-col justify-between">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
  
        {/* Post Image Skeleton */}
        <div className="h-80 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
  
        {/* Likes and Caption Skeleton */}
        <div className="space-y-3 mb-4 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
  
        {/* Like/Dislike Buttons Skeleton */}
        <div className="flex items-center gap-6 mb-4 animate-pulse">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
  
        {/* Comment Input Skeleton */}
        <div className="flex items-center gap-3 mt-4 mb-6 animate-pulse">
          <div className="w-full h-10 bg-gray-300 rounded"></div>
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
        </div>
  
        {/* Comments Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border-t border-gray-200 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Show More/Show Fewer Comments Skeleton */}
        <div className="mt-4">
          <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  };
  
export default FullPostPageSkeleton;

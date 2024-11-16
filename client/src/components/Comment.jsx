import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Comment = ({ comment }) => {
  return (
    <div className="my-2 max-w-[70%]">
      {/* User Info: Avatar and Username */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${comment?.author?._id}`}>
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <AvatarImage
              src={comment?.author?.profilePicture}
              alt="profile_pic"
            />
            <AvatarFallback>DP</AvatarFallback>
          </Avatar>
        </Link>
        <Link to={`/profile/${comment?.author?._id}`}>
          <h1 className="font-bold text-sm sm:text-base md:text-lg cursor-pointer">
            {comment?.author?.username}
          </h1>
        </Link>
        <span className="text-sm text-gray-500 ml-2">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>

      {/* Comment Text */}
      <div className="pl-11 sm:pl-12 md:pl-14 mt-1">
        <p className="font-normal text-xs sm:text-sm md:text-base break-words whitespace-normal">
          {comment?.text}
        </p>
      </div>
    </div>
  );
};

export default Comment;

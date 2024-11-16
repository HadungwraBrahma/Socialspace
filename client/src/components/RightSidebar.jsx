import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className="w-fit my-10 pr-32">
      <Link to={`/profile/${user?._id}`}>
        <div className="flex items-center gap-2 hover:bg-gray-100 rounded">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="post_image" />
            <AvatarFallback>DP</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="font-semibold text-sm">{user?.username}</h1>
            <span className="text-gray-600 text-sm">
              {user?.bio || "Bio here..."}
            </span>
          </div>
        </div>
      </Link>
      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;

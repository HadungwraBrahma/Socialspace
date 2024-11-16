import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
      </div>
      {suggestedUsers.map((user) => {
        return (
          <><Link to={`/profile/${user?._id}`}>
            <div
              key={user._id}
              className="flex items-center justify-between my-5 hover:bg-gray-100 rounded"
            >
              <div className="flex items-center gap-2">
                
                  <Avatar>
                    <AvatarImage src={user?.profilePicture} alt="post_image" />
                    <AvatarFallback>DP</AvatarFallback>
                  </Avatar>
                

                <div>
                  <h1 className="font-semibold text-sm">
                    {user?.username}
                  </h1>
                  <span className="text-gray-600 text-sm">
                    {user?.bio || "Bio here..."}
                  </span>
                </div>
              </div>
            </div></Link>
          </>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;

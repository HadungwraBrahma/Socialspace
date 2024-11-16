import React from "react";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main Feed Area */}
      <div className="flex-grow w-full lg:w-3/4 xl:w-4/5">
        <Feed />
      </div>

      {/* Right Sidebar - Hidden on smaller screens */}
      <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

const ProfileSkeleton = () => {
  return (
    <div className="flex justify-center mx-auto lg:pl-10">
      <div className="flex flex-col gap-20 p-8 max-w-5xl w-full">
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Profile Picture */}
          <section className="flex items-center justify-center">
            <Avatar className="h-40 w-40 border-4 border-gray-100 animate-pulse">
              <AvatarImage alt="profilePicture" className="animate-pulse" />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          </section>

          {/* Profile Information */}
          <section className="flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              {/* Username and Edit Profile Button */}
              <div className="flex items-center gap-3">
                <div className="w-32 h-6 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              {/* Stats: Posts, Followers, Following */}
              <div className="flex items-center gap-6 text-gray-600 text-sm">
                <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              {/* Bio Section */}
              <div className="flex flex-col gap-2">
                <Badge className="w-32 h-6 bg-gray-300 rounded-md animate-pulse">
                  <AtSign />
                  <span className="pl-1">username</span>
                </Badge>
                <div className="w-48 h-4 bg-gray-300 rounded-md animate-pulse"></div>
              </div>
            </div>
          </section>
        </div>

        {/* Tabs for Posts / Saved */}
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm text-gray-600 py-3">
            <div className="w-20 h-6 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-20 h-6 bg-gray-300 rounded-md animate-pulse"></div>
          </div>

          {/* Posts Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl animate-pulse"
              >
                <div className="w-full h-40 bg-gray-300 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-white space-x-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import axiosInstance from "@/axiosInstance";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SearchProfile = () => {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/api/v1/user/serach?q=${query}`);

      if (res.data.profiles.length > 0) {
        setProfiles(res.data.profiles);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const truncateBio = (bio, maxLength = 100) => {
    if (bio?.length > maxLength) {
      return bio.slice(0, maxLength) + "...";
    }
    return bio;
  };

  return (
    <div className="h-full w-full max-w-md mx-auto mt-7 px-4 pt-7 sm:px-6 lg:px-8">
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg focus:outline-none transition duration-200 ease-in-out"
          onClick={handleSearch}
        >
          <Search size={20} />
        </Button>
      </div>

      {isSearching ? (
        <div className="text-center text-gray-600">
          <h1 className="text-xl">Searching...</h1>
        </div>
      ) : profiles !== null && profiles?.length === 0 ? (
        <div className="text-center text-gray-600">
          <h1 className="text-xl">No profiles found!</h1>
        </div>
      ) : (
        <div>
          {profiles?.map((user) => {
            return (
              <Link to={`/profile/${user?._id}`} key={user._id}>
                <div className="flex items-center justify-between my-4 p-4 rounded-lg hover:bg-gray-100 transition-all duration-200 ease-in-out">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user?.profilePicture} alt="profile" />
                      <AvatarFallback>DP</AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="font-semibold text-lg text-gray-800">
                        {user?.username}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {truncateBio(user?.bio || "No bio available")}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchProfile;

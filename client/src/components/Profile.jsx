import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser, setSelectedUser } from "@/redux/authSlice";
import ProfileSkeleton from "@/skeletons/ProfileSkeleton";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const { userProfile, user, isLoading } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [isFollowing, setIsFollowing] = useState(
    user?.following?.includes(userId) || false
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handelTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const followUnfollowHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        let newFollowing;
        if (isFollowing) {
          newFollowing = user.following.filter((id) => id !== userId);
        } else {
          newFollowing = [...user.following, userId];
        }

        const updatedUser = { ...user, following: newFollowing };
        dispatch(setAuthUser(updatedUser));
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message);
    }
  };

  const messageHandler = async () => {
    dispatch(setSelectedUser(userProfile));
    navigate("/chat");
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="flex justify-center mx-auto lg:pl-10">
      <div className="flex flex-col gap-20 p-8 max-w-5xl w-full">
        {/* Profile head section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="flex items-center justify-center">
            <Avatar className="h-40 w-40 border-4 border-gray-100 hover:border-gray-300 transition-all duration-300">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilePicture"
              />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar>
          </section>
          <section className="flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-gray-800">
                  {userProfile?.username}
                </span>
                {isLoggedInUserProfile ? (
                  <Link to="/account/edit">
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 text-sm py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      Edit profile
                    </Button>
                  </Link>
                ) : isFollowing ? (
                  <>
                    <Button
                      onClick={followUnfollowHandler}
                      variant="secondary"
                      className="text-sm py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      Unfollow
                    </Button>
                    <Button
                      onClick={messageHandler}
                      variant="secondary"
                      className="text-sm py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={followUnfollowHandler}
                    className="bg-[#0095F6] hover:bg-[#3192d2] text-sm py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-6 text-gray-600 text-sm">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts.length}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers.length}{" "}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following.length}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="w-fit" variant="secondary">
                  <span className="text-xl">@{userProfile?.username}</span>
                </Badge>
                <span className="font-semibold text-gray-600">
                  {userProfile?.bio || "Bio here..."}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Tabs sections for Posts and bookmarked */}
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm text-gray-600">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold text-gray-900" : ""
              }`}
              onClick={() => handelTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold text-gray-900" : ""
              }`}
              onClick={() => handelTabChange("saved")}
            >
              BOOKMARKS
            </span>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedPost?.map((post) => (
              <Link
                key={post?._id}
                to={`/post/${post._id}`}
                className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={post.image}
                  alt="postimage"
                  className="rounded-lg my-2 w-full aspect-square object-cover transition-transform duration-300 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-white space-x-4">
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <Heart />
                      <span>{post?.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <MessageCircle />
                      <span>{post?.comments.length}</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from "react";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setSelectedUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPost, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const {
    likeNotification = [],
    followNotification = [],
    commentNotification = [],
  } = useSelector((store) => store.realTimeNotification || {});

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search Profile" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="User_profile_picture" />
          <AvatarFallback>DP</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://socialspace-server.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPost([]));

        // Ensure navigate happens after state updates
        setTimeout(() => {
          navigate("/login", { replace: true });
          window.location.reload();
        }, 0);

        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const createPostHandler = () => {
    setOpen(true);
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      createPostHandler();
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      dispatch(setSelectedUser(null));
      navigate("/chat");
    } else if (textType === "Search Profile") {
      navigate("/search");
    } else if (textType === "Notifications") {
      navigate("/notifications");
    }
    setSidebarOpen(false);
  };

  const hasNotifications =
    likeNotification.length > 0 ||
    followNotification.length > 0 ||
    commentNotification.length > 0;

  return (
    <>
      {/* Toggle button for small screens */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-20 text-gray-700 lg:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 z-10 left-0 px-4 border-r border-gray-300 h-screen w-[70%] lg:w-[16%] transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform bg-white`}
      >
        <div className="flex flex-col">
          <h1 className="my-8 pl-3 font-bold text-xl">Socialspace</h1>
          <div>
            {sidebarItems.map((item, index) => {
              return (
                <div
                  onClick={() => sidebarHandler(item.text)}
                  key={index}
                  className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
                >
                  {item.icon}
                  <span>{item.text}</span>
                  {item.text === "Notifications" && hasNotifications && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 absolute bottom-6 left-6 bg-red-600 hover:bg-red-600 "
                        >
                          {likeNotification.length +
                            followNotification.length +
                            commentNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <>
                          {likeNotification.length > 0 && (
                            <div>
                              <h3 className="font-semibold">Likes</h3>
                              {likeNotification.map((notification) => {
                                return (
                                  <div
                                    key={notification.userId}
                                    className="flex items-center gap-2 my-2"
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          notification.userDetails
                                            ?.profilePicture
                                        }
                                      />
                                      <AvatarFallback>DP</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">
                                      <span className="font-bold">
                                        {notification.userDetails?.username}
                                      </span>{" "}
                                      liked your post
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {followNotification.length > 0 && (
                            <div>
                              <h3 className="font-semibold">Follows</h3>
                              {followNotification.map((notification) => {
                                return (
                                  <div
                                    key={notification.userId}
                                    className="flex items-center gap-2 my-2"
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          notification.userDetails
                                            ?.profilePicture
                                        }
                                      />
                                      <AvatarFallback>DP</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">
                                      <span className="font-bold">
                                        {notification.userDetails?.username}
                                      </span>{" "}
                                      started following you
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {commentNotification.length > 0 && (
                            <div>
                              <h3 className="font-semibold">Comments</h3>
                              {commentNotification.map((notification) => {
                                return (
                                  <div
                                    key={notification.userId}
                                    className="flex items-center gap-2 my-2"
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          notification.userDetails
                                            ?.profilePicture
                                        }
                                      />
                                      <AvatarFallback>DP</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">
                                      <span className="font-bold">
                                        {notification.userDetails?.username}
                                      </span>{" "}
                                      commented: {notification.commentText}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <CreatePost open={open} setOpen={setOpen} />
      </div>
    </>
  );
};

export default LeftSidebar;

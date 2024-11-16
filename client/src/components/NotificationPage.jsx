import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  clearLikeNotifications,
  clearFollowNotifications,
  clearCommentNotifications,
} from "@/redux/rtnSlice";

const NotificationPage = () => {
  const dispatch = useDispatch();

  const {
    likeNotification = [],
    followNotification = [],
    commentNotification = [],
  } = useSelector((store) => store.realTimeNotification || {});

  // Combine notifications and sort by time
  const allNotifications = [
    ...likeNotification,
    ...followNotification,
    ...commentNotification,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleClearAllNotifications = () => {
    dispatch(clearLikeNotifications());
    dispatch(clearFollowNotifications());
    dispatch(clearCommentNotifications());
  };

  // Function to truncate commentText if it exceeds a certain length
  const truncateText = (text, maxLength = 100) => {
    return text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto mt-7">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 z-1">
        <h1 className="mb-10 text-4xl font-semibold text-gray-800">
          <u>Notifications</u>
        </h1>

        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
          {allNotifications.length > 0 && (
            <button
              onClick={handleClearAllNotifications}
              className="absolute top-4 right-4 text-sm text-red-500 hover:text-red-700 focus:outline-none"
            >
              Clear Notifications
            </button>
          )}

          {allNotifications.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No new notifications
            </p>
          ) : (
            allNotifications.map((notification) => (
              <div
                key={`${notification.userId}-${notification.type}-${notification.timestamp}`}
                className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={notification.userDetails?.profilePicture}
                  />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
                <p className="text-base text-gray-700">
                  <span className="font-bold text-gray-900">
                    {notification.userDetails?.username}
                  </span>{" "}
                  {notification.type === "like"
                    ? "liked your post"
                    : notification.type === "follow"
                    ? "started following you"
                    : notification.type === "dislike"
                    ? "disliked your post"
                    : notification.type === "comment"
                    ? `commented: "${truncateText(notification.commentText)}"`
                    : "unfollowed you"}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;

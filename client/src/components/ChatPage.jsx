import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode, ArrowLeft } from "lucide-react";
import Messages from "./Messages";
import axiosInstance from "@/axiosInstance";
import { setMessages } from "@/redux/chatSlice";

const ChatPage = () => {
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const [textMessage, setTextMessage] = useState("");

  const usersToDisplay = suggestedUsers.filter((suggestedUser) =>
    user?.following?.includes(suggestedUser._id)
  );

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackClick = () => {
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="flex flex-col lg:flex-row lg:ml-[18%] h-screen overflow-hidden bg-gray-50">
      {/* Left Section: Suggested Users */}
      <section
        className={`w-full lg:w-1/3 my-8 px-4 lg:px-0 bg-white rounded-lg shadow-lg ${
          !selectedUser ? "block" : "hidden"
        }`}
      >
        <h1 className="font-bold mb-4 text-xl text-gray-700 mt-4">
          {user?.username} chats
        </h1>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto max-h-[80vh] space-y-4">
          {usersToDisplay.length === 0 ? (
            <div className="text-gray-500 text-center">
              Follow other users to chat.
            </div>
          ) : (
            usersToDisplay.map((suggestedUser) => {
              const isOnline = onlineUsers.includes(suggestedUser?._id);
              return (
                <div
                  key={suggestedUser._id}
                  onClick={() => dispatch(setSelectedUser(suggestedUser))}
                  className="flex gap-3 items-center p-4 hover:bg-gray-100 cursor-pointer rounded-lg transition-all duration-200 ease-in-out"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback>DP</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {suggestedUser?.username}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isOnline ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Chatting section */}
      {selectedUser ? (
        <section className="flex-1 bg-white flex flex-col h-full shadow-lg rounded-lg">
          <div className="flex justify-between items-center px-5 py-4 pt-12 border-b border-gray-300 sticky top-0 bg-white z-10 shadow-md">
            <div className="flex gap-3 items-center">
              <Avatar>
                <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                <AvatarFallback>DP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {selectedUser?.username}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-200"
              onClick={handleBackClick}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Message Page */}
          <Messages selectedUser={selectedUser} />

          {/* New Message Input */}
          <div className="flex items-center p-4 border-t border-t-gray-300 bg-white">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Type a message..."
            />
            <Button
              onClick={() => sendMessageHandler(selectedUser._id)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex-col items-center justify-center mx-auto hidden lg:block">
          <MessageCircleCode className="w-32 h-32 my-4 text-gray-400" />
          <h1 className="font-medium text-xl text-gray-700">Your message</h1>
          <span className="text-gray-500">Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

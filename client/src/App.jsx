import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import {
  setLikeNotification,
  setFollowNotification,
  setCommentNotification,
} from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import SearchProfile from "./components/SearchProfile";
import NotificationPage from "./components/NotificationPage";
import FullPostPage from "./components/FullPostPage";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/search",
        element: (
          <ProtectedRoutes>
            <SearchProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoutes>
            <NotificationPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/post/:postId",
        element: (
          <ProtectedRoutes>
            <FullPostPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification:like", (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socketio.on("notification:follow", (notification) => {
        dispatch(setFollowNotification(notification));
      });

      socketio.on("notification:comment", (notification) => {
        dispatch(setCommentNotification(notification));
      });

      return () => {
        socketio.disconnect();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.disconnet();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;

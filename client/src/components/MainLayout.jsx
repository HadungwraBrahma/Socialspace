import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../redux/authSlice";
import { setSelectedPost, setPost } from "../redux/postSlice";
import axios from "axios";
import { toast } from "sonner";

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (
            error.response.data.message ===
            "Session expired. Please log in again."
          ) {
            toast.error("Your session has expired. Please log in again.");

            dispatch(setAuthUser(null));
            dispatch(setSelectedPost(null));
            dispatch(setPost([]));

            navigate("/login");
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
    };
  }, [dispatch, navigate]);

  return (
    <div>
      <LeftSidebar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

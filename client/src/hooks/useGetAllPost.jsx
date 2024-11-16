import { useEffect } from "react";
import axiosInstance from "@/axiosInstance";
import { useDispatch } from "react-redux";
import { setPost } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/post/all");
        if (res.data.success) {
          dispatch(setPost(res.data.posts));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;

import { useEffect } from "react";
import axiosInstance from "@/axiosInstance";
import { useDispatch } from "react-redux";
import { setPost, setLoading } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      dispatch(setLoading(true));
      try {
        const res = await axiosInstance.get("/api/v1/post/all");
        if (res.data.success) {
          dispatch(setPost(res.data.posts));
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;

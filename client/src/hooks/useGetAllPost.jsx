import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPost } from "@/redux/postSlice";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("https://socialspace-server.onrender.com/api/v1/post/all", {
          withCredentials: true,
        });
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

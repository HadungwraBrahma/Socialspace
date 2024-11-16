import { useEffect } from "react";
import axiosInstance from "@/axiosInstance";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSUggestedUsers = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/user/suggested");
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchSUggestedUsers();
  }, [dispatch]);
};

export default useGetSuggestedUsers;

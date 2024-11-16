import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSUggestedUsers = async () => {
      try {
        const res = await axios.get("https://socialspace-server.onrender.com/api/v1/user/suggested", {
          withCredentials: true,
        });
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

import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserProfile, setLoading } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      dispatch(setLoading(true));
      
      try {
        const res = await axios.get(
          `https://socialspace-server.onrender.com/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (err) {
        console.log(err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUserProfile();
  }, [dispatch, userId]);
};

export default useGetUserProfile;

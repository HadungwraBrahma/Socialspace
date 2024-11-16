import { useEffect } from "react";
import axiosInstance from "@/axiosInstance";
import { useDispatch } from "react-redux";
import { setUserProfile, setLoading } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      dispatch(setLoading(true));

      try {
        const res = await axiosInstance.get(`/api/v1/user/${userId}/profile`);
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

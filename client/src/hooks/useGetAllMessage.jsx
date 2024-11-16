import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/chatSlice";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        const res = await axios.get(
          `https://socialspace-server.onrender.com/api/v1/message/all/${selectedUser?._id}`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllMessage();
  }, [dispatch, selectedUser]);
};

export default useGetAllMessage;

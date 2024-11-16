import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://socialspace-server.onrender.com",
  withCredentials: true,
});

export default axiosInstance;

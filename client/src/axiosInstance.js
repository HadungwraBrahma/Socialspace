import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://socialspace-server.onrender.com",
  // baseURL: "http://localhost:8000", // for dev 
  withCredentials: true,
});

export default axiosInstance;

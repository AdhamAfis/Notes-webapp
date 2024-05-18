import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } else {
      console.error("localStorage is not accessible");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance
  .get("/")
  .then((response) => {
    console.log("Response:", response.data);
  })
  .catch((error) => {
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
  });

export default axiosInstance;

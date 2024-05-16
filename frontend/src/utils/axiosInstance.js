import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://backend-gamma-topaz-49.vercel.app/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Check if localStorage is accessible
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

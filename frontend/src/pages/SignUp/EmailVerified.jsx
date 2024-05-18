import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const EmailVerified = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axiosInstance
        .get(`/verify-email/${token}`)
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.error(
            "Error verifying email:",
            error.response ? error.response.data : error.message
          );
        });
    }

    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <section className="bg-primary dark:bg-gray-900 h-screen flex justify-center items-center">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Email Successfully Verified
          </h2>
          <p className="text-lg">
            You will be redirected to the home page shortly...
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmailVerified;

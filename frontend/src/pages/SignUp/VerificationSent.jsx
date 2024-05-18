import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerificationSent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <section className="bg-primary dark:bg-gray-900 h-screen flex justify-center items-center">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Verification Email Sent</h2>
          <p className="text-lg mb-2">
            Please check your email for verification.
          </p>
          <p className="text-lg">Redirecting to home page...</p>
        </div>
      </div>
    </section>
  );
};

export default VerificationSent;

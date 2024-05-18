import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [showResendLink, setShowResendLink] = useState(false);

  const navigate = useNavigate();

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (submitted && newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setPasswordError("");
    setVerificationError("");
    setShowResendLink(false);

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await axiosInstance.post("/login", {
        identifier: identifier,
        password: password,
      });
      if (response && response.status === 200) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setPasswordError("Invalid email or password");
        } else if (error.response.status === 404) {
          setPasswordError("User not found");
        } else if (error.response.status === 403) {
          setVerificationError("Email not verified. Please verify your email.");
          setShowResendLink(true);
        } else if (error.response.status === 498) {
          setVerificationError(
            "Verification token expired. Please resend the verification email."
          );
          setShowResendLink(true);
        } else if (error.response.status === 500) {
          setPasswordError("Internal server error");
        }
      } else if (error.request) {
        // The request was made but no response was received
        setPasswordError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setPasswordError("Error: " + error.message);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await axiosInstance.post("/resend-verification-email", {
        email: identifier,
      });
      if (response.status === 200) {
        setVerificationError(
          "Verification email resent. Please check your inbox."
        );
        setShowResendLink(false);
      }
    } catch (error) {
      setVerificationError(
        "Failed to resend verification email. Please try again later."
      );
    }
  };

  return (
    <section className="bg-primary dark:bg-gray-900 h-screen flex justify-center items-center">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address or Username
              </label>
              <div className="mt-2">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={handleIdentifierChange}
                  className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-secondary hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    passwordError ? "border-red-500" : ""
                  }`}
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-500">{passwordError}</p>
                )}
                {verificationError && (
                  <p className="mt-2 text-sm text-red-500">
                    {verificationError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          {showResendLink && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResendVerification}
                className="font-semibold text-secondary hover:text-indigo-500"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link
              to="/signup"
              className="font-semibold leading-6 text-secondary hover:text-indigo-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;

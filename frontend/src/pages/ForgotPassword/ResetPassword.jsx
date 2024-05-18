import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if password is at least 6 characters long
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await axiosInstance.post(`/reset-password/${token}`, {
        newPassword: newPassword,
      });
      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      setError("Error resetting password. Please try again later.");
    }
  };

  // Password strength calculation
  const getPasswordStrengthLevel = () => {
    const strength = zxcvbn(newPassword).score;
    if (strength < 2) {
      return <span className="text-red-500">Weak</span>;
    } else if (strength < 3) {
      return <span className="text-yellow-500">Strong</span>;
    } else {
      return <span className="text-green-500">Very Strong</span>;
    }
  };

  return (
    <div className="bg-primary dark:bg-gray-900 h-screen flex justify-center items-center">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Reset Your Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {newPassword && (
                  <p className="mt-2 text-sm text-gray-500">
                    Password Strength: {getPasswordStrengthLevel()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Reset Password
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-center text-green-500">{message}</p>
          )}
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

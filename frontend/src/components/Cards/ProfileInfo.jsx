import React from "react";
import { getInitials, capitalizeFirstTwoWords } from "../../utils/helper";


const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center font-medium rounded-full  bg-slate-100">
            {getInitials(userInfo.username || "random name")}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{userInfo.username || "random name"}</h2>
          <button onClick={onLogout} className="text-sm text-black-500 underline">
            Logout
            </button>
        </div>
      </div>
    </>
  );
};

export default ProfileInfo;

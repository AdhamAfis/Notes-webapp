import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = ({ userInfo, onSearchNote, onClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onClearSearch();
  };

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    onSearchNote(value);
  };

  return (
    <div className="text-centred bg-white flex items-centered justify-between px-6 py-2 drop-shadow">
      <h2 className="text-2xl font-bold text-black-400 py-">Notes</h2>
      <SearchBar
        value={searchQuery}
        onChange={handleChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />
      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
};

export default Navbar;

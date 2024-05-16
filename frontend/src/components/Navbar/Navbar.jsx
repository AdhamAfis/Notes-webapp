import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import DOMPurify from 'dompurify'; // Import DOMPurify

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
    navigate("/");
  };

  const handleChange = (event) => {
    const { value } = event.target;
    const sanitizedValue = DOMPurify.sanitize(value); // Sanitize the input value
    setSearchQuery(sanitizedValue);
    onSearchNote(sanitizedValue);
  };

  return (
    <div className="text-center bg-white flex flex-col md:flex-row items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-2xl font-bold text-black-400 py-1">My Notes</h2>
      <SearchBar
        value={searchQuery}
        onChange={handleChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        className="w-80 mt-2"
      />
      <ProfileInfo userInfo={userInfo} onLogout={onLogout} className="mt-2" />
    </div>
  );
};

export default Navbar;

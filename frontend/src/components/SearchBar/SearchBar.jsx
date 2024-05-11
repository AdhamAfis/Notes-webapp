import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ value, onChange, onSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-4 bg-gray-100 rounded-md">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search"
        className="w-full bg-transparent py-2 pr-2 outline-none text-gray-800"
      />
      {value ? (
        <FaTimes
          onClick={onClearSearch}
          className="text-lg text-gray-500 cursor-pointer ml-2"
        />
      ) : (
        <FaSearch
          onClick={onSearch}
          className="text-lg text-gray-500 cursor-pointer ml-2"
        />
      )}
    </div>
  );
};

export default SearchBar;

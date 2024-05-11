import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };
  const handleRemoveTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-centered gap-2 text-sm text-white px-3 py-1 rounded bg-secondary"
            >
              # {tag}
              <button
                onClick={() => {
                  handleRemoveTag(index);
                }}
              >
                <AiOutlineClose className="hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          className="text-sm bg-transparent border-b border-secondary w-full focus:outline-none focus:border-primary"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-transparent flex items-center justify-center focus:outline-none border border-secondary rounded-full p-1 hover:bg-secondary hover:text-white"
          onClick={handleAddTag}
        >
          <AiOutlinePlus className="text-2xl text-secondary hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;

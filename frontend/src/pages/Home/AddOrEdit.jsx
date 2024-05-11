import React, { useState } from "react";
import TagInput from "../../components/Input/TagInput";
import { AiOutlineClose } from "react-icons/ai";
import axiosInstance from "../../utils/axiosInstance";

const AddOrEdit = ({ type, noteData, getNotes, onClose, notify }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);
  const [isAddingOrUpdate, setIsAddingOrUpdate] = useState(false);

  const addNote = async () => {
    try {
      setIsAddingOrUpdate(true);
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });
      if (response.status === 201) {
        getNotes(); // Refresh notes
        onClose(); // Close modal
        notify('success', 'Note added successfully');
      }
    } catch (error) {
      console.log(error);
      notify('error', 'Failed to add note');
    } finally {
      setIsAddingOrUpdate(false);
    }
  };

  const editNote = async () => {
    try {
      setIsAddingOrUpdate(true);
      const response = await axiosInstance.put(`/edit-note/${noteData._id}`, {
        title,
        content,
        tags,
      });
      if (response.status === 200) {
        getNotes(); // Refresh notes
        onClose(); // Close modal
        notify('success', 'Note updated successfully');
      }
    } catch (error) {
      console.log(error);
      notify('error', 'Failed to update note');
    } finally {
      setIsAddingOrUpdate(false);
    }
  };

  const handleAddOrUpdate = () => {
    if (title.trim() === "" || content.trim() === "") {
      setError("Please fill all the fields");
      return;
    }
    setError(null);

    if (type === "edit") {
      editNote();
    } else {
      addNote();
    }
  };

  return (
    <div className="relative">
      <button
        className="w-10 h-10 rounded flex items-center justify-center absolute -top3 -right-3 hover:bg-slate-50 "
        onClick={onClose}
      >
        <AiOutlineClose className="text-xl hover:text-red-500" />
      </button>
      <div className="flex flex-col gap-2">
        <label className="input-label">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl text-slate-500 outline-none bg-transparent "
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">Content</label>
        <textarea
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-sm text-black p-2 bg-slate-50 outline-none rounded"
          rows={10}
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">Tags</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>
     
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        className={`bg-secondary text-white text-2xl rounded px-5 py-3 w-full font-semibold focus:outline-none font-right mt-4 ${isAddingOrUpdate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-dark'}`}
        onClick={handleAddOrUpdate}
        disabled={isAddingOrUpdate}
      >
        {type === "edit" ? "Update" : "Add"}
      </button>
    </div>
  );
};

export default AddOrEdit;
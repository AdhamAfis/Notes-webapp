import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { AiOutlinePlus } from "react-icons/ai";
import AddOrEdit from "./AddOrEdit";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [openAddOrEditModal, setOpenAddOrEditModal] = useState({
    isOpen: false,
    type: "add",
    note: null,
  });
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to refresh notes
  const getNotes = async (query) => {
    try {
      let endpoint = "/notes";
      if (query) {
        endpoint = `/search-notes?q=${encodeURIComponent(query)}`;
      }
      const response = await axiosInstance.get(endpoint);
      if (response.status && response.data) {
        setAllNotes(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle modal close after adding or updating note
  const handleCloseModal = () => {
    setOpenAddOrEditModal({ isOpen: false, type: "add", data: null });
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/user");
        if (response.status && response.data) {
          setUserInfo(response.data);
        }
      } catch (error) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };

    getUserInfo();
    getNotes();
  }, [navigate]);

  // Add toast notification
  const notify = (type, message) => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    }
  };
  //funtion to edit a note
  

  // Function to pin a note
  const pinNote = async (noteId) => {
    try {
      await axiosInstance.put(`/pin-note/${noteId}`);
      getNotes();
    } catch (error) {
      notify('error', 'Failed to pin note');
      console.error("Error pinning note:", error);
    }
  };

  // Function to delete a note
  const deleteNote = async (noteId) => {
    try {
      await axiosInstance.delete(`/delete-note/${noteId}`);
      getNotes();
      notify('success', 'Note deleted successfully');
    } catch (error) {
      notify('error', 'Failed to delete note');
      console.error("Error deleting note:", error);
    }
  };

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={(query) => {
          setSearchQuery(query);
          setIsSearch(query !== "");
          getNotes(query);
        }}
        onClearSearch={() => {
          setSearchQuery("");
          setIsSearch(false);
          getNotes();
        }}
      />
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          {allNotes.map((note) => (
            <NoteCard
              key={note._id}
              title={note.title}
              content={note.content}
              date={moment(note.createdAt).format("MMM Do YY")}
              tags={note.tags}
              isPinned={note.isPinned}
              onEdit={() => setOpenAddOrEditModal({ isOpen: true, type: "edit", data: note })}
              onDelete={() => deleteNote(note._id)}
              onPin={() => pinNote(note._id)}
            />
          ))}
        </div>
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-secondary absolute right-10 bottom-10"
        onClick={() => setOpenAddOrEditModal({ isOpen: true, type: "add", data: null })}
      >
        <AiOutlinePlus className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddOrEditModal.isOpen}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll-hidden"
      >
        <AddOrEdit
          type={openAddOrEditModal.type}
          noteData={openAddOrEditModal.data}
          onClose={handleCloseModal}
          getNotes={getNotes} // Passing getNotes function
          notify={notify} // Passing notify function for toast notifications
        />
      </Modal>
      <ToastContainer />
    </>
  );
};

export default Home;

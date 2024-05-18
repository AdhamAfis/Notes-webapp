import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { AiOutlinePlus, AiOutlineFileText } from "react-icons/ai";
import AddOrEdit from "./AddOrEdit";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css"; // Import your custom CSS file

const Home = () => {
  const [openAddOrEditModal, setOpenAddOrEditModal] = useState({
    isOpen: false,
    type: "add",
    note: null,
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleCloseModal = () => {
    setOpenAddOrEditModal({ isOpen: false, type: "add", data: null });
    setSelectedNote(null);
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
          navigate("/");
        }
      }
    };

    getUserInfo();
    getNotes();
  }, [navigate]);

  const notify = (type, message) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    }
  };

  const pinNote = async (noteId) => {
    try {
      await axiosInstance.put(`/pin-note/${noteId}`);
      getNotes();
    } catch (error) {
      notify("error", "Failed to pin note");
      console.error("Error pinning note:", error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axiosInstance.delete(`/delete-note/${noteId}`);
      getNotes();
      notify("success", "Note deleted successfully");
    } catch (error) {
      notify("error", "Failed to delete note");
      console.error("Error deleting note:", error);
    }
  };

  return (
    <>
    <section className=" text-gray-600 h-screen body-font bg-primary">
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
        {allNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
            <AiOutlineFileText className="text-6xl text-gray-400" />
            <p className="text-gray-500 mt-4">
              No notes available. Create a new note to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                content={note.content}
                date={moment(note.createdAt).format("MMM Do YY")}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() =>
                  setOpenAddOrEditModal({
                    isOpen: true,
                    type: "edit",
                    data: note,
                  })
                }
                onDelete={() => deleteNote(note._id)}
                onPin={() => pinNote(note._id)}
                onClick={() => setSelectedNote(note)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-secondary hover:bg-indigo-500 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddOrEditModal({ isOpen: true, type: "add", data: null })
        }
      >
        <AiOutlinePlus className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddOrEditModal.isOpen || selectedNote !== null}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          content: {
            width: "40%",
            maxWidth: "600px",
            maxHeight: "60vh",
            margin: "auto",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
        contentLabel=""
      >
        <div className="modal-content">
          {selectedNote ? (
            <div>
              <h2 className="text-3xl font-bold">{selectedNote.title}</h2>
              <p className="text-lg">{selectedNote.content}</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                {selectedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <AddOrEdit
              type={openAddOrEditModal.type}
              noteData={openAddOrEditModal.data}
              onClose={handleCloseModal}
              getNotes={getNotes}
              notify={notify}
            />
          )}
        </div>
      </Modal>
      <ToastContainer className="
        mt-10
      " />
    </section>
    </>
  );
};

export default Home;

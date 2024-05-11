import React, { useState } from "react";
import {
  AiOutlinePushpin,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { CSSTransition } from "react-transition-group";
import './NoteCard.css';


const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onPin,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Call the onDelete function, which will delete the note
    await onDelete();
  };

  return (
    <CSSTransition
      in={!isDeleting}
      timeout={500}
      classNames="note-card"
      unmountOnExit
    >
      <div className={`border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out`}>
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-2xl font-medium">{title}</h6>
            <span className="text-s text-slate-500">{date}</span>
          </div>
          <AiOutlinePushpin
            onClick={onPin}
            className={`hover:text-green-500 icon-btn ${isPinned ? 'text-green-500' : 'text-slate-500'}`}
          />
        </div>
        <p className="text-xl text-slate-600 mt-2">{content?.slice(0, 60)}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="text-s text-slate-500">{tags}</div>
          <div className="flex items-center gap-2">
            <AiOutlineEdit
              onClick={onEdit}
              className="icon-btn hover:text-green-500 cursor-pointer"
            />
            <AiOutlineDelete
              onClick={handleDelete}
              className="icon-btn hover:text-red-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default NoteCard;

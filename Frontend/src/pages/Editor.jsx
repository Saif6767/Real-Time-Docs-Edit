import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

const socket = io("http://localhost:5000"); 

const Editor = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const textareaRef = useRef();

  const user = {
    userId: localStorage.getItem("userId") || "guest", 
    username: localStorage.getItem("username") || "Guest",
  };


  const fetchDoc = async () => {
    try {
      const res = await API.get(`/docs/${id}`);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoc();
    
    socket.emit("join-document", { docId: id, userId: user.userId, username: user.username });

    
    socket.on("receive-changes", (newContent) => {
      setContent(newContent);
    });

    
    socket.on("active-collaborators", (list) => {
      setCollaborators(list);
    });

    return () => {
      socket.off("receive-changes");
      socket.off("active-collaborators");
    };
  }, [id]);

  
  const handleChange = (e) => {
    setContent(e.target.value);
    socket.emit("send-changes", { docId: id, content: e.target.value });
  };

  
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await API.put(`/docs/${id}`, { content });
        console.log("Auto-saved");
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [content, id]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Editing Document {id}</h2>

      <div className="mb-4">
        <p className="text-gray-500 text-sm">
          Active collaborators: {collaborators.join(", ") || "No one else"}
        </p>
      </div>

      <textarea
        ref={textareaRef}
        className="w-full min-h-[60vh] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={content}
        onChange={handleChange}
      />
    </div>
  );
};

export default Editor;

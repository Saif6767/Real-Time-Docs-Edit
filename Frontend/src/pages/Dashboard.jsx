import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  // Fetch documents
  const fetchDocs = async () => {
    try {
      const res = await API.get("/docs");
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Create new document
  const handleNewDocument = async () => {
    const title = prompt("Enter document title:") || "Untitled Document";
    try {
      const res = await API.post("/docs", { title });
      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-700">My Documents</h2>
        <button
          onClick={handleNewDocument}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md shadow-md transition"
        >
          + New Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => (
          <Link
            key={doc._id}
            to={`/editor/${doc._id}`}
            className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition border border-gray-100 flex flex-col justify-between"
          >
            <h3 className="text-xl font-semibold text-gray-800">{doc.title}</h3>
            <p className="text-gray-500 mt-2 text-sm">
              Click to open and edit this document.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

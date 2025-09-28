import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Document from "./models/Document.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docsRoutes);

// Socket.IO setup
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Track users per document
const documentsUsers = {}; // { docId: [{ socketId, userId, username }] }

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join document
  socket.on("join-document", async ({ docId, userId, username }) => {
    socket.join(docId);
    console.log(`User ${username} joined document ${docId}`);

    if (!documentsUsers[docId]) documentsUsers[docId] = [];

    // Avoid duplicates
    if (!documentsUsers[docId].some(u => u.userId === userId)) {
      documentsUsers[docId].push({ socketId: socket.id, userId, username });
    }

    // Emit active collaborators to all clients in the room
    const activeUsers = documentsUsers[docId].map(u => u.username);
    io.to(docId).emit("active-collaborators", activeUsers);

    // Merge with existing collaborators in MongoDB
    try {
      const doc = await Document.findById(docId);
      if (doc) {
        const merged = Array.from(new Set([...doc.collaborators, ...activeUsers]));
        await Document.findByIdAndUpdate(docId, { collaborators: merged }, { new: true });
      }
    } catch (err) {
      console.error("Error updating collaborators in DB:", err.message);
    }
  });

  // Broadcast text changes
  socket.on("send-changes", ({ docId, content }) => {
    socket.to(docId).emit("receive-changes", content);
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    for (const docId in documentsUsers) {
      const index = documentsUsers[docId].findIndex(u => u.socketId === socket.id);
      if (index !== -1) {
        documentsUsers[docId].splice(index, 1);

        const activeUsers = documentsUsers[docId].map(u => u.username);
        io.to(docId).emit("active-collaborators", activeUsers);

        // Update MongoDB collaborators (remove disconnected user)
        try {
          const doc = await Document.findById(docId);
          if (doc) {
            const updatedCollabs = doc.collaborators.filter(c => activeUsers.includes(c));
            await Document.findByIdAndUpdate(docId, { collaborators: updatedCollabs }, { new: true });
          }
        } catch (err) {
          console.error("Error updating collaborators on disconnect:", err.message);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

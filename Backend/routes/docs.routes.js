import express from "express";
import Document from "../models/Document.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create new document
router.post("/", auth, async (req, res) => {
  const { title } = req.body;
  try {
    const doc = await Document.create({ title, ownerId: req.user.id });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all documents for user
router.get("/", auth, async (req, res) => {
  try {
    const docs = await Document.find({ ownerId: req.user.id });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get single document
router.get("/:id", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update document content
router.put("/:id", auth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, lastUpdated: Date.now() },
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

export default router;

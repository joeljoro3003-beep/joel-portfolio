require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /contact — Save a new contact message
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic presence check before Mongoose validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields (name, email, message) are required.'
      });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    return res.status(201).json({
      success: true,
      message: 'Message received! I will get back to you soon.'
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: errors.join('. ') });
    }
    console.error('Contact route error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});

// GET /messages — Admin: retrieve all messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    console.error('Messages route error:', err);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// Serve index.html for all other routes (SPA fallback)
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

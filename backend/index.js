const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const config = require("./config");

mongoose.connect(config.connectionString);
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const User = require("./models/user.model");
const Note = require("./models/note.model");
const { authenticateToken } = require("./utilities");


//get user
app.get("/user", authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const userId = decodedToken.username;
  try {
    const user = await User.findOne({ username: userId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



// Sign up endpoint
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Check for missing inputs
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token for the new user with expiration (e.g., 1 hour)
    const accessToken = jwt.sign(
      { username: newUser.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Login endpoint
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  // Check for missing inputs
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  try {
    // Find user by username or email (case insensitive)
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${identifier}$`, "i") } },
        { email: { $regex: new RegExp(`^${identifier}$`, "i") } },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // If username/email and password are correct, generate a JWT token with expiration (e.g., 1 hour)
    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Create a new note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;

  // Decode the token to retrieve user information
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const userId = decodedToken.username;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const newNote = new Note({
      title,
      content,
      tags: tags || [],
      userId: userId,
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Edit notes
app.put("/edit-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid;
  const { title, content, tags } = req.body;
  const { user } = req;
  if (!title && !content && !tags) {
    return res.status(400).json({ message: "No Changes Made" });
  }
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (title) {
      note.title = title;
    }
    if (content) {
      note.content = content;
    }
    if (tags) {
      note.tags = tags;
    }
    await note.save();
    return res.json(note);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//Get all notes
app.get("/notes", authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const userId = decodedToken.username;
  try {
    const notes = await Note.find({ userId });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Delete note
app.delete("/delete-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid;
  const { user } = req;
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    await Note.findByIdAndDelete(noteId);
    return res.json({ message: "Note deleted" }); // Send a success message
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//pin note
app.put("/pin-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid;
  const { user } = req;
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    note.isPinned = !note.isPinned;
    await note.save();
    return res.json(note);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//search notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { q } = req.query;
  const { user } = req;
  try {
    const notes = await Note.find({
      userId: user.username,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $in: [q] } },
      ],
    });
    return res.json(notes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

module.exports = app;

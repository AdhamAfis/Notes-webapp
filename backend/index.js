const express = require("express"); // Import the express package
const bodyParser = require("body-parser"); // Import the body-parser package
const cors = require("cors"); // Import the cors package
const mongoose = require("mongoose"); // Import the mongoose package
const bcrypt = require("bcrypt"); // Import the bcrypt package
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken package
const nodemailer = require("nodemailer"); // Import the nodemailer package
const helmet = require("helmet"); // Import the helmet package
const rateLimit = require("express-rate-limit"); // Import the express-rate-limit package
const sanitizeHtml = require("sanitize-html"); // Import the sanitize-html package
const User = require("./models/user.model"); // Import the User model
const Note = require("./models/note.model"); // Import the Note model
const { authenticateToken } = require("./utilities"); // Import the authenticateToken middleware
const { encodeXText } = require("nodemailer/lib/shared"); // Import the encodeXText function

const app = express(); // Create an express application
require("dotenv").config(); // Load environment variables from the .env file
const config = require("./config"); // Import the config file

mongoose.connect(config.connectionString); // Connect to the MongoDB database using the connection string
app.use(express.json()); // Parse JSON bodies

// Content Security Policy (CSP) Middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdnjs.cloudflare.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
  })
);

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parse URL-encoded bodies
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Your email provider
  port: process.env.EMAIL_PORT, // Your email provider's port
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

// Sanitize user input function
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "a"],
    allowedAttributes: {
      a: ["href"],
    },
  });
};

const userUrl = process.env.USER_URL; // Your frontend URL

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

// Sign up endpoint with email verification
app.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;

  // Sanitize inputs
  username = sanitizeHtml(username);
  email = sanitizeHtml(email);
  password = sanitizeHtml(password);

  // Check for missing inputs
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  // Convert username and email to lowercase
  username = username.toLowerCase();
  email = email.toLowerCase();

  // Check if password is at least 6 characters long
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
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

    // Generate verification token
    const verificationToken = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Create a new user with verification token and hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Save the new user to the database
    await newUser.save();

    // Send verification email
    const verificationLink = `${userUrl}/verify-email/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          /* Email styles */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
      
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
      
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 10px;
          }
      
          p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 20px;
          }
      
          a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
          }
      
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Hello  ${username},</p>
          <p>Welcome to our platform! Please verify your email address by clicking the following link:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>If you did not sign up for an account, you can safely ignore this email.</p>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>`,
    });

    res.status(201).json({ message: "User created. Verification email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Resend verification email endpoint
app.post("/resend-verification-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate a new verification token
    const verificationToken = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Update the user's verification token
    user.verificationToken = verificationToken;

    await user.save();

    // Send the verification email
    const verificationLink = `${userUrl}/verify-email/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email Address",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
          h1 { color: #333333; font-size: 24px; margin-bottom: 10px; }
          p { color: #555555; font-size: 16px; margin-bottom: 20px; }
          a { color: #007bff; text-decoration: none; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; color: #888888; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Hello,</p>
          <p>Please verify your email address by clicking the following link:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>If you did not sign up for an account, you can safely ignore this email.</p>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>`,
    });

    res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Login endpoint
app.post("/login", async (req, res) => {
  let { identifier, password } = req.body;

  // Sanitize inputs
  identifier = sanitizeHtml(identifier);
  password = sanitizeHtml(password);

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

    // Check if the user's email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
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

app.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;
  console.log("Entered verify email");

  try {
    // Decode the token to extract user information
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Ensure you use the correct secret
    const { email } = decodedToken;
    // Find the user by email and update their record to mark email as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );
    if (!user) {
      // Handle case where user is not found
      return res.status(404).json({ message: "User not found" }); // Send a 404 Not Found status code
    }  
    console.log("Email verified successfully"); // Redirect the user to a confirmation page
  } catch (error) {
    console.error("Error verifying email:", error); // Log any errors to the console
    res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint to request password reset
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate unique token for password reset
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    // Store the reset token and its expiration time in the user document
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour in milliseconds
    await user.save(); // Save the updated user
    // Construct the reset link with the token
    const resetLink = `${userUrl}/reset-password/${token}`;
    // Send password reset link with token via email
    await transporter.sendMail({ 
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          /* Reset CSS */
          body, h1, p {
            margin: 0;
            padding: 0;
          }
      
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
          }
      
          /* Container styles */
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
      
          /* Heading styles */
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 10px;
          }
      
          /* Paragraph styles */
          p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 20px;
          }
      
          /* Link styles */
          a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
          }
      
          /* Footer styles */
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>Please click <a href="${resetLink}">Here</a> to reset your password.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
      `,
    }); // Send the email
    res.status(200).json({ message: "Password reset link sent to email" }); // Send a 200 OK status code
  } catch (error) {
    console.error("Error sending password reset email:", error); // Log any errors to the console
    res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Endpoint to reset password using JWT token
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params; // Extract the token from the request parameters
  let { newPassword } = req.body; // Extract the new password from the request body
  newPassword = sanitizeHtml(newPassword);  // Sanitize HTML input
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET); // Ensure you use the correct secret
    const { email } = decodedToken; // Extract email from token
    const user = await User.findOne({ email }); // Find the user by email
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Send a 404 Not Found status code
    }

    // Check if the reset token in the request matches the stored reset token
    if (user.resetToken !== token) {
      return res.status(400).json({ message: "Invalid reset token" }); // Send a 400 Bad Request status code
    }

    // Check if the reset token has expired
    if (user.resetTokenExpires && user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" }); // Send a 400 Bad Request status code
    }

    // Check if the new password is longer than 6 characters
    if (newPassword.length <= 6) {
      return res
        .status(400)
        .json({ message: "Password must be longer than 6 characters" }); // Send a 400 Bad Request status code
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password
    // Update user's password and clear reset token fields
    user.password = hashedPassword; // Set the new password
    user.resetToken = null; // Clear the reset token
    user.resetTokenExpires = null; // Clear the reset token and expiration date
    await user.save(); // Save the updated user
    // Respond with success message
    res.status(200).json({ message: "Password reset successful" }); // Send a 200 OK status code
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Create a new note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body; // Extract the title, content, and tags from the request body
  // Decode the token to retrieve user information
  const token = req.headers.authorization.split(" ")[1]; // Extract the token from the request headers
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Decode the token
  const userId = decodedToken.username; // Extract the user ID from the token
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" }); // Send a 400 Bad Request status code
  }

  try {
    const newNote = new Note({
      title: sanitizeInput(title), // Sanitize input
      content: sanitizeInput(content), // Sanitize input
      tags: tags ? tags.map((tag) => sanitizeInput(tag)) : [], // Sanitize input
      userId: userId, // Add the user ID to the note
    });
    await newNote.save();
    res.status(201).json(newNote); // Send the new note as a JSON response
  } catch (error) {
    console.error(error); // Log any errors to the console
    res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Edit notes
app.put("/edit-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid; // Extract the note ID from the request parameters
  const { title, content, tags } = req.body; // Extract the title, content, and tags from the request body
  const { user } = req; // Extract the user object from the request
  if (!title && !content && !tags) {
    return res.status(400).json({ message: "No Changes Made" }); // Send a 400 Bad Request status code
  }
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username }); // Find the note by ID and user ID
    if (!note) {
      return res.status(404).json({ message: "Note not found" }); // Send a 404 Not Found status code
    }
    if (title) {
      note.title = sanitizeInput(title); // Sanitize input
    }
    if (content) {
      note.content = sanitizeInput(content); // Sanitize input
    }
    if (tags) {
      note.tags = tags.map((tag) => sanitizeInput(tag)); // Sanitize input
    }
    await note.save();
    return res.json(note); // Send the updated note as a JSON response
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

//Get all notes
app.get("/notes", authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Extract the token from the request headers
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Decode the token
  const userId = decodedToken.username; // Extract the user ID from the token
  try {
    const notes = await Note.find({ userId }); // Find all notes with the user ID
    res.json(notes); // Send the notes as a JSON response
  } catch (error) {
    console.error(error); // Log any errors to the console
    res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Delete note
app.delete("/delete-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid; // Extract the note ID from the request parameters
  const { user } = req; // Extract the user object from the request
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username }); // Find the note by ID and user ID
    if (!note) {
      return res.status(404).json({ message: "Note not found" }); // Send a 404 Not Found status code
    }
    await Note.findByIdAndDelete(noteId);
    return res.json({ message: "Note deleted" }); // Send a success message
  } catch (error) {
    console.error(error); // Log any errors to the console
    return res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Pin note
app.put("/pin-note/:noteid", authenticateToken, async (req, res) => {
  const noteId = req.params.noteid; // Extract the note ID from the request parameters
  const { user } = req; // Extract the user object from the request
  try {
    const note = await Note.findOne({ _id: noteId, userId: user.username }); // Find the note by ID and user ID
    if (!note) {
      return res.status(404).json({ message: "Note not found" }); // Send a 404 Not Found status code
    }
    note.isPinned = !note.isPinned; // Toggle the isPinned property
    await note.save(); // Save the updated note
    return res.json(note); // Send the updated note as a JSON response
  } catch (error) {
    console.error(error); // Log any errors to the console
    return res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

// Search notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { q } = req.query; // Extract the query parameter from the request
  const { user } = req; // Extract the user object from the request
  try {
    const notes = await Note.find({
      userId: user.username, // Find notes by user ID
      $or: [
        { title: { $regex: q, $options: "i" } }, // Search by title (case-insensitive)
        { content: { $regex: q, $options: "i" } }, // Search by content (case-insensitive)
        { tags: { $in: [q] } }, // Search by tags
      ],
    });
    return res.json(notes); // Send the notes as a JSON response
  } catch (error) {
    console.error(error); // Log any errors to the console
    return res.status(500).json({ message: "Internal server error" }); // Send a 500 Internal Server Error status code
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000"); // Log a message when the server is running
});

module.exports = app; // Export the app object

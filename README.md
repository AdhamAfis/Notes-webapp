# Notes App

This project is a simple notes application that allows users to sign up or log in to securely manage their notes. Users can create, edit, pin, and delete notes. The application consists of a frontend built with Vite and React, and a backend built with Express.js and MongoDB. User authentication is implemented using JWT tokens.

## Features

- **User Authentication**: Users can sign up with a unique username, email, and password, or log in with their credentials. Passwords are securely hashed before being stored in the database.
- **Create Notes**: Authenticated users can create new notes by providing a title, content, and optional tags. Notes are associated with the user who created them.
- **Edit Notes**: Users can edit existing notes by modifying the title, content, or tags. Only the user who created a note can edit it.
- **Pin Notes**: Users can pin or unpin notes to prioritize important ones. Pinned notes are displayed prominently in the user interface.
- **Delete Notes**: Authenticated users can delete unwanted notes. Once deleted, notes are permanently removed from the database.
- **Search Notes**: Users can search for specific notes by title, content, or tags. The search functionality allows users to quickly find relevant information.
- **Email Verification**: Users must verify their email address after signing up before they can log in.
- **Password Reset**: Users can request a password reset if they forget their password.

## [Demo](https://note-deployment.vercel.app/)

## Backend

### Technologies Used

- **Express.js**: A minimalist web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing user data and notes.
- **JWT (JSON Web Tokens)**: A method for securely transmitting information between parties as JSON objects.
- **Bcrypt**: A library for hashing passwords before storing them in the database.
- **Cors**: A package for providing a Connect/Express middleware that can be used to enable CORS with various options.
- **Nodemailer**: A module for Node.js applications to send email.
- **Helmet**: A middleware to secure Express apps by setting various HTTP headers.
- **Rate Limit**: A middleware to limit repeated requests to public APIs.

### Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/AdhamAfis/Notes-webapp.git
   ```
2. Navigate to the backend directory:
   ```sh
   cd backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Create a `.env` file in the root directory of the backend with the following structure:
   ```env
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   JWT_SECRET=<your-jwt-secret>
   EMAIL_HOST=<your-email-host>
   EMAIL_PORT=<your-email-port>
   EMAIL_USER=<your-email-user>
   EMAIL_PASSWORD=<your-email-password>
   USER_URL=<your-frontend-url>
   ```
   Replace the placeholders with your actual values.

### Backend API Endpoints

- **POST /signup**: Register a new user.
- **POST /resend-verification-email**: Resend email verification link.
- **POST /login**: Log in an existing user.
- **GET /user**: Get user details.
- **POST /add-note**: Add a new note.
- **PUT /edit-note/:noteid**: Edit an existing note.
- **GET /notes**: Get all notes of the authenticated user.
- **DELETE /delete-note/:noteid**: Delete a note.
- **PUT /pin-note/:noteid**: Pin or unpin a note.
- **GET /search-notes**: Search notes by title, content, or tags.
- **POST /forgot-password**: Request a password reset link.
- **POST /reset-password/:token**: Reset password using the token.

## Frontend

### Technologies Used

- **Vite**: A fast build tool that provides a lightning-fast dev server with hot module replacement (HMR) and incredibly fast builds.
- **React**: A JavaScript library for building user interfaces.
- **React Router**: Declarative routing for React applications.
- **Axios**: Promise-based HTTP client for the browser and Node.js.
- **React Icons**: A collection of popular icon libraries made available as React components.
- **React Modal**: Accessible modal dialog component for React.
- **React Toastify**: React notification library.
- **React Transition Group**: An animation library for React.

### Getting Started with Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Acknowledgements

- Express.js
- MongoDB
- JWT
- Bcrypt
- Vite
- React
- React Router
- Axios
- React Icons
- React Modal
- React Toastify
- React Transition Group

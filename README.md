# Notes App

This project is a simple notes application that allows users to sign up or log in to securely manage their notes. Users can create, edit, pin, and delete notes. The application consists of a frontend built with Vite and React, and a backend built with Express.js and MongoDB. User authentication is implemented using JWT tokens.

## Features

- **User Authentication**: Users can sign up with a unique username, email, and password, or log in with their credentials. Passwords are securely hashed before being stored in the database.

- **Create Notes**: Authenticated users can create new notes by providing a title, content, and optional tags. Notes are associated with the user who created them.

- **Edit Notes**: Users can edit existing notes by modifying the title, content, or tags. Only the user who created a note can edit it.

- **Pin Notes**: Users can pin or unpin notes to prioritize important ones. Pinned notes are displayed prominently in the user interface.

- **Delete Notes**: Authenticated users can delete unwanted notes. Once deleted, notes are permanently removed from the database.

- **Search Notes**: Users can search for specific notes by title, content, or tags. The search functionality allows users to quickly find relevant information.

## Backend

### Technologies Used

- **Express.js**: A minimalist web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing user data and notes.
- **JWT (JSON Web Tokens)**: A method for securely transmitting information between parties as JSON objects.
- **Bcrypt**: A library for hashing passwords before storing them in the database.
- **Cors**: A package for providing a Connect/Express middleware that can be used to enable CORS with various options.

### Backend Setup

1. Clone the repository: `git clone https://github.com/AdhamAfis/Notes-webapp.git`
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a `config.json` file in the root directory of the backend with the following structure:
   ```json
   {
     "ACCESS_TOKEN_SECRET": "<your-access-token-secret>"
   }

Replace `<your-access-token-secret>` with your actual secret key.

### Backend API Endpoints

- `POST /signup`: Register a new user.
- `POST /login`: Log in an existing user.
- `GET /user`: Get user details.
- `POST /add-note`: Add a new note.
- `PUT /edit-note/:noteid`: Edit an existing note.
- `GET /notes`: Get all notes of the authenticated user.
- `DELETE /delete-note/:noteid`: Delete a note.
- `PUT /pin-note/:noteid`: Pin or unpin a note.
- `GET /search-notes`: Search notes by title, content, or tags.

### Frontend Technologies Used

- **Vite**: A fast build tool that provides a lightning-fast dev server with hot module replacement (HMR) and incredibly fast builds.
- **React**: A JavaScript library for building user interfaces.
- **React Router**: Declarative routing for React applications.
- **Axios**: Promise-based HTTP client for the browser and Node.js.
- **React Icons**: A collection of popular icon libraries made available as React components.
- **React Modal**: Accessible modal dialog component for React.
- **React Toastify**: React notification library.
- **React Transition Group**: An animation library for React.

### Getting Started with Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md) to contribute to this project.

### License

This project is licensed under the [MIT License](LICENSE).

### Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [JWT](https://jwt.io/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Modal](https://github.com/reactjs/react-modal)
- [React Toastify](https://github.com/fkhadra/react-toastify)
- [React Transition Group](https://reactcommunity.org/react-transition-group/)


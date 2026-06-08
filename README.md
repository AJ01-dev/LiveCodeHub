# CodeCollab

A production-ready, real-time collaborative coding platform built with the MERN stack. Code together in shared rooms with live code sync, room chat, online presence, and integrated code execution via Judge0.

## Features

- **JWT Authentication** — Signup, login, password hashing (bcrypt), protected routes
- **Room System** — Create/join rooms with unique IDs, MongoDB persistence
- **Collaborative Editor** — Monaco Editor with real-time sync (Socket.io)
- **Multi-Language Support** — JavaScript, Python, Java, C++
- **Code Execution** — Run code with custom input via Judge0 API
- **Real-Time Chat** — Room-based messaging with sender names
- **Online Users** — Live user list with join/leave notifications
- **Dark Theme UI** — Modern, responsive Tailwind CSS design

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, Monaco  |
| Backend    | Node.js, Express.js, Socket.io      |
| Database   | MongoDB Atlas                       |
| Auth       | JWT + bcrypt                        |
| Execution  | Judge0 API (RapidAPI)               |

## Project Structure

```
CodeCollab/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── UsersSidebar.jsx
│   │   ├── context/            # Auth context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Room.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/           # API & socket services
│   │   │   ├── api.js
│   │   │   ├── index.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # DB, JWT, languages
│   │   │   ├── db.js
│   │   │   ├── jwt.js
│   │   │   └── languages.js
│   │   ├── controllers/        # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── executionController.js
│   │   │   └── roomController.js
│   │   ├── middleware/         # Auth & error handling
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Message.js
│   │   │   ├── Room.js
│   │   │   └── User.js
│   │   ├── routes/             # Express routes
│   │   │   ├── authRoutes.js
│   │   │   ├── executionRoutes.js
│   │   │   └── roomRoutes.js
│   │   ├── socket/             # Socket.io handlers
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── AppError.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── MONGODB_SETUP.md
│   └── JUDGE0_SETUP.md
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- RapidAPI account for Judge0 (free tier works)

### 1. Clone and install dependencies

```bash
cd CodeCollab
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**Server** — copy and edit `server/.env`:

```bash
cp server/.env.example server/.env
```

**Client** — copy and edit `client/.env`:

```bash
cp client/.env.example client/.env
```

See [MongoDB Setup Guide](docs/MONGODB_SETUP.md) and [Judge0 Setup Guide](docs/JUDGE0_SETUP.md) for detailed configuration.

### 3. Start development servers

Terminal 1 — Backend:

```bash
cd server
npm run dev
```

Terminal 2 — Frontend:

```bash
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Usage

1. **Sign up** at `/signup` or **log in** at `/login`
2. From the **Dashboard**, create a new room or join with a Room ID
3. Share the Room ID with collaborators
4. Edit code together in real time
5. Use the **Chat** panel to communicate
6. Click **Run Code** to execute with optional custom input

## API Endpoints

### Auth
| Method | Endpoint        | Description     |
|--------|-----------------|-----------------|
| POST   | /api/auth/signup | Register user  |
| POST   | /api/auth/login  | Login user     |
| GET    | /api/auth/me     | Get current user (protected) |

### Rooms
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| POST   | /api/rooms                  | Create room        |
| GET    | /api/rooms/my               | Get user's rooms   |
| GET    | /api/rooms/:roomId          | Get room details   |
| POST   | /api/rooms/:roomId/join     | Validate join      |
| GET    | /api/rooms/:roomId/messages | Get chat history   |
| PATCH  | /api/rooms/:roomId/language | Change language    |

### Execution
| Method | Endpoint              | Description    |
|--------|-----------------------|----------------|
| POST   | /api/execute/run      | Run code       |
| GET    | /api/execute/languages | List languages |

## Socket.io Events

| Event            | Direction     | Description              |
|------------------|---------------|--------------------------|
| join-room        | Client → Server | Join a coding room     |
| room-joined      | Server → Client | Room data on join      |
| code-change      | Client → Server | Broadcast code edits   |
| code-update      | Server → Client | Receive remote edits   |
| chat-message     | Client → Server | Send chat message      |
| new-message      | Server → Client | Receive chat message   |
| user-joined      | Server → Client | User joined notification |
| user-left        | Server → Client | User left notification |
| users-update     | Server → Client | Updated user list      |
| language-change  | Client → Server | Change room language   |
| save-code        | Client → Server | Persist code to DB     |

## Production Build

```bash
# Build frontend
cd client && npm run build

# Start server (serves API; host client build separately or via CDN)
cd server && npm start
```

Set `NODE_ENV=production` and use strong `JWT_SECRET` values in production.

## License

MIT
# LiveCodeHub

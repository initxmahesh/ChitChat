# ChitChat

A real-time group chat application built with React, Node.js, Express, Socket.io, and MongoDB. Users can register, create or join password-protected rooms, and communicate live with typing indicators and per-room presence awareness.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Socket.io-client |
| Backend | Node.js, Express 5, Socket.io 4 |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in `httpOnly` cookie |
| Deployment | Google Cloud Run (single container) |

---

## Features

- Email + password authentication with persistent sessions
- Create public or password-protected chat rooms
- Real-time messaging over WebSockets
- Live typing indicators
- Per-room online/offline presence
- Profile management - update display name, username, or password
- Account deletion


### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ChitChat.git
cd ChitChat
```

### 2. Configure environment variables

Create `server/.env` with the following content:

```env
# Port the Express server listens on:

PORT=5000 or 8xxx

# MongoDB Atlas connection string:

MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<appName>

# Secret used to sign JWT tokens

JWT_SECRET=your_jwt_secret_here

# Allowed CORS origin - your frontend URL
# Comma-separate multiple values:

CLIENT_ORIGIN=http://localhost:5173
```

---

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend (separate terminal)
cd client && npm install
```

### 4. Start the development servers

```bash
# Terminal 1 — backend (from /server)
npm run server

# Terminal 2 — frontend (from /client)
npm run dev
```

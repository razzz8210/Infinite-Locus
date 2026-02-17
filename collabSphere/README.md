# CollabSphere

A real-time document collaboration platform.

## Tech Stack

**Frontend:** React, Tailwind CSS,  Editor, Socket.IO Client

**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Installation

1. Install frontend dependencies
```bash
cd collabSphere
npm install
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Create `.env` file in `server/` folder:


4. Start backend
```bash
cd server
npm run dev
```

5. Start frontend
```bash
npm run dev
```

## Features

- User authentication (login/signup)
- Create and edit documents
- Real-time collaboration
- Auto-save
- Version history
- Share documents with collaborators

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create document
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/versions` - Get version history
- `POST /api/documents/:id/versions/:vid/restore` - Restore version


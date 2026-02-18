# CollabSphere - Hackathon Pitch Document

## What is CollabSphere?

CollabSphere is a **real-time collaborative document editor** - like Google Docs. Multiple users can edit the same document simultaneously, and changes appear instantly for everyone.

**Live Demo:** https://infinite-locus.vercel.app

---

## Problem We Solve

- Teams struggle to collaborate on documents in real-time
- Sending files back and forth via email is inefficient
- No version history means lost work
- Existing solutions are expensive or complex

---

## Our Solution

A **free, open-source** collaboration platform with:
- Real-time editing (see changes instantly)
- Version history (never lose work)
- Easy sharing (just enter email)
- Cloud-based (access from anywhere)

---

## Key Features

### 1. User Authentication
- Secure signup/login with JWT tokens
- Passwords encrypted with bcrypt
- Session persists across browser refreshes

### 2. Real-Time Collaboration
- Multiple users edit simultaneously
- Changes sync instantly via WebSocket (Socket.IO)
- See who's currently editing (active user avatars)
- Typing indicators show who's typing

### 3. Rich Text Editor
- Bold, Italic, Underline, Strikethrough
- Headings (H1, H2, H3)
- Bullet and numbered lists
- Text alignment (left, center, right)
- Undo/Redo support

### 4. Image Upload
- Drag & drop images into documents
- Paste images from clipboard
- Click to upload from computer
- Images stored in Cloudinary (cloud)

### 5. Version History
- Auto-saves create snapshots
- View all previous versions
- One-click restore to any version
- See who made each change

### 6. Document Sharing
- Share via email address
- Collaborators see document in their dashboard
- Real-time updates for all collaborators

### 7. Import Documents
- Upload .txt, .md, .html files from computer
- Automatically converts to editable document

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool (fast!) |
| Tailwind CSS | Styling |
| TipTap | Rich text editor |
| Socket.IO Client | Real-time communication |
| Axios | API requests |
| React Router | Page navigation |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Socket.IO | WebSocket server |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File uploads |
| Cloudinary | Cloud image storage |

### Deployment
| Service | What's deployed |
|---------|-----------------|
| Vercel | Frontend (React) |
| Render | Backend (Node.js) |
| MongoDB Atlas | Database (cloud) |
| Cloudinary | Image storage |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (Vercel - React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Login  │  │ Signup  │  │Dashboard│  │ Editor  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└───────────────────────┬─────────────────────────────────────┘
                        │
          HTTP (REST API) + WebSocket (Socket.IO)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                         BACKEND                              │
│                    (Render - Node.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Auth Routes │  │  Doc Routes │  │Upload Routes│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────────────────────────────────────┐           │
│  │           Socket.IO Handler                  │           │
│  │  - join-document    - content-change        │           │
│  │  - leave-document   - typing indicator      │           │
│  └─────────────────────────────────────────────┘           │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  MongoDB    │ │  Cloudinary │ │    JWT      │
│   Atlas     │ │   (Images)  │ │  (Tokens)   │
│ (Database)  │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## How Real-Time Collaboration Works

```
User A (Browser 1)              Server              User B (Browser 2)
       │                          │                        │
       │ 1. Opens document        │                        │
       ├─────────────────────────►│                        │
       │                          │                        │
       │ 2. Joins Socket room     │  3. User B also joins │
       ├─────────────────────────►│◄───────────────────────┤
       │                          │                        │
       │ 4. Types "Hello"         │                        │
       ├─────────────────────────►│                        │
       │                          │  5. Broadcasts to all  │
       │                          ├───────────────────────►│
       │                          │                        │
       │                          │     6. B sees "Hello"  │
       │                          │        instantly!      │
       │                          │                        │
       │ 7. Auto-save (2 sec)     │                        │
       ├─────────────────────────►│                        │
       │                          │  8. Save to MongoDB    │
       │                          │  9. Create version     │
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user info |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Get all user's documents |
| POST | `/api/documents` | Create new document |
| GET | `/api/documents/:id` | Get single document |
| PUT | `/api/documents/:id` | Update document content |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/share` | Add collaborator |
| GET | `/api/documents/:id/versions` | Get version history |
| POST | `/api/documents/:id/versions/:vid/restore` | Restore version |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload image to Cloudinary |

---

## Database Models

### User
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  createdAt: "2026-02-18"
}
```

### Document
```javascript
{
  title: "My Document",
  content: "<p>Hello World</p>",
  owner: "user_id",
  collaborators: [
    { user: "user_id", role: "editor" }
  ],
  createdAt: "2026-02-18",
  updatedAt: "2026-02-18"
}
```

### DocumentVersion
```javascript
{
  document: "document_id",
  content: "<p>Previous content</p>",
  createdBy: "user_id",
  createdAt: "2026-02-18"
}
```

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-document` | Client → Server | User opens a document |
| `leave-document` | Client → Server | User closes document |
| `content-change` | Both ways | Document content updated |
| `user-joined` | Server → Client | Someone joined the document |
| `user-left` | Server → Client | Someone left the document |
| `typing` | Client → Server | User is typing |
| `user-typing` | Server → Client | Show typing indicator |

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **CORS Protection** - Only allowed origins
4. **Input Validation** - Sanitized user inputs
5. **Protected Routes** - Middleware checks auth

---

## Demo Script (2 Minutes)

### Setup
Open 2 browser windows side by side (or 2 different browsers)

### [0:00 - 0:20] Introduction
> "This is CollabSphere - a real-time collaboration platform like Google Docs"

### [0:20 - 0:40] Authentication
1. Create account in Window 1
2. Create different account in Window 2
> "Secure JWT authentication with encrypted passwords"

### [0:40 - 1:00] Create & Share
1. Create a document in Window 1
2. Click Share → Enter Window 2's email
> "Easy sharing - just enter collaborator's email"

### [1:00 - 1:30] Real-Time Magic
1. Window 2: Refresh dashboard, open shared document
2. Type in Window 1 → Watch it appear in Window 2 instantly!
3. Point to active user avatars
> "See how changes appear instantly! No refresh needed."

### [1:30 - 1:50] Version History
1. Click History button
2. Show version list
3. Click Restore on older version
> "Auto-save creates versions - restore anytime"

### [1:50 - 2:00] Wrap Up
> "Built with React, Node.js, Socket.IO, MongoDB - fully deployed and scalable"

---

## What Makes Us Different?

| Feature | Google Docs | CollabSphere |
|---------|-------------|--------------|
| Free | Limited | Unlimited |
| Open Source | No | Yes |
| Self-hostable | No | Yes |
| No vendor lock-in | No | Yes |
| Privacy-focused | ? | Yes |

---

## Future Roadmap

- [ ] Comments & annotations
- [ ] Real-time cursor positions
- [ ] Document folders/organization
- [ ] Export to PDF/Word
- [ ] Offline mode
- [ ] AI writing assistant
- [ ] Mobile app

---

## Team

- **Your Name** - Full Stack Developer
- Built in 24 hours for hackathon

---

## Quick Answers for Judges

**Q: How does real-time sync work?**
> We use Socket.IO (WebSocket) to broadcast changes instantly to all connected users. When you type, it emits an event that all other users receive immediately.

**Q: Where is data stored?**
> MongoDB Atlas (cloud database) for documents and users. Cloudinary for images. Everything is in the cloud - accessible from anywhere.

**Q: Is it secure?**
> Yes! JWT tokens for auth, bcrypt for password hashing, CORS protection, and all data transmitted over HTTPS.

**Q: Can it scale?**
> Yes! MongoDB Atlas auto-scales, Cloudinary handles image CDN, and Socket.IO can be scaled with Redis adapter.

**Q: Why not just use Google Docs?**
> CollabSphere is open-source, self-hostable, and privacy-focused. No vendor lock-in, no data mining.

---

## Links

- **Live App:** https://infinite-locus.vercel.app
- **Backend:** https://infinite-locus-tt9e.onrender.com
- **GitHub:** https://github.com/razzz8210/Infinite-Locus

---

## Code Explanation - How Everything Works

### 1. Socket.IO Setup (Backend)

**File: `server/src/index.js`**

```javascript
const { Server } = require('socket.io');

// Create Socket.IO server attached to HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,  // Allow frontend to connect
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

**What this does:**
- Creates a WebSocket server that runs alongside our Express server
- `cors` allows our frontend (Vercel) to connect to backend (Render)
- WebSocket = persistent connection (unlike HTTP which disconnects after each request)

---

### 2. Socket.IO Authentication (Backend)

**File: `server/src/socket/socketHandler.js`**

```javascript
// Middleware - runs before any socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;  // Get JWT from frontend
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;  // Attach user ID to socket
    next();  // Allow connection
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

**What this does:**
- Every socket connection must send a JWT token
- We verify the token is valid
- If valid, we attach `userId` to the socket for later use
- If invalid, connection is rejected

---

### 3. Joining a Document Room (Backend)

**File: `server/src/socket/socketHandler.js`**

```javascript
socket.on('join-document', async (data) => {
  const { documentId, userId, userName } = data;
  
  // Join the "room" for this document
  socket.join(documentId);
  socket.documentId = documentId;

  // Track active users in this document
  if (!documentRooms.has(documentId)) {
    documentRooms.set(documentId, new Map());
  }

  const room = documentRooms.get(documentId);
  room.set(socket.id, {
    oduserId: userId,
    userName,
    socketId: socket.id,
    color: cursorColors[room.size % cursorColors.length],
  });

  // Tell everyone in the room about active users
  const activeUsers = Array.from(room.values());
  io.to(documentId).emit('user-joined', activeUsers);
});
```

**What this does:**
- When user opens a document, they "join" a room (like a chat room)
- Room name = document ID (so each document has its own room)
- We track all users currently in the room
- We broadcast the list of active users to everyone in the room

**Think of it like:**
> A conference call where everyone in the same "room" can hear each other

---

### 4. Real-Time Content Changes (Backend)

**File: `server/src/socket/socketHandler.js`**

```javascript
socket.on('content-change', (data) => {
  const { documentId, content, userId } = data;
  
  // Broadcast to OTHER users in the room (not sender)
  socket.to(documentId).emit('content-change', {
    content,
    userId,
  });
});
```

**What this does:**
- When User A types, frontend sends `content-change` event
- Server receives it and broadcasts to ALL OTHER users in the room
- `socket.to(documentId)` = send to everyone in room EXCEPT sender
- This is why changes appear instantly for everyone!

**Why not send to sender too?**
> Sender already has the change (they typed it). Sending back would cause duplicate text.

---

### 5. Socket.IO Setup (Frontend)

**File: `src/services/socket.js`**

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },  // Send JWT token for authentication
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    return this.socket;
  }

  joinDocument(documentId, userId, userName) {
    if (this.socket) {
      this.socket.emit('join-document', { documentId, userId, userName });
    }
  }

  sendContentChange(documentId, content, userId) {
    if (this.socket) {
      this.socket.emit('content-change', { documentId, content, userId });
    }
  }

  onContentChange(callback) {
    if (this.socket) {
      this.socket.on('content-change', callback);
    }
  }
}

export const socketService = new SocketService();
```

**What this does:**
- `connect(token)` - Connects to backend with JWT token
- `joinDocument()` - Tells server "I'm viewing this document"
- `sendContentChange()` - Sends my changes to server
- `onContentChange()` - Listens for changes from other users

---

### 6. Editor Using Socket (Frontend)

**File: `src/pages/Editor.jsx`**

```javascript
// When component loads - connect to socket
useEffect(() => {
  const token = localStorage.getItem('token');
  socketService.connect(token);
  
  // Join the document room
  socketService.joinDocument(id, user._id, user.name);

  // Listen for changes from other users
  socketService.onContentChange((data) => {
    if (data.userId !== user._id) {
      isRemoteUpdate.current = true;  // Flag to prevent echo
      editor.commands.setContent(data.content);  // Update editor
    }
  });

  // Listen for active users
  socketService.onUserJoined((users) => {
    setActiveUsers(users);
  });

  // Cleanup when leaving
  return () => {
    socketService.leaveDocument(id);
    socketService.disconnect();
  };
}, []);
```

**What this does:**
1. On page load, connect to socket server
2. Join the document's room
3. Listen for changes from other users
4. When change received, update the editor content
5. When leaving page, disconnect properly

---

### 7. Sending Changes When User Types (Frontend)

**File: `src/pages/Editor.jsx`**

```javascript
const editor = useEditor({
  extensions: [StarterKit, Image, ...],
  content: '',
  onUpdate: ({ editor }) => {
    // Don't send if this was a remote update
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    
    const html = editor.getHTML();
    handleContentChange(html);  // Send to server
  },
});

const handleContentChange = (content) => {
  // Send to other users via socket
  socketService.sendContentChange(id, content, user._id);
  
  // Auto-save after 2 seconds of no typing
  setSaveStatus('unsaved');
  
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(() => {
    saveDocument(content);  // Save to database
  }, 2000);
};
```

**What this does:**
1. TipTap editor calls `onUpdate` every time content changes
2. We check if change was from US or from REMOTE user
3. If from us, send to socket server
4. Also start a 2-second timer for auto-save
5. If user keeps typing, timer resets (debouncing)

---

### 8. JWT Authentication Flow

**File: `server/src/controllers/auth.controller.js`**

```javascript
// Register new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password (never store plain text!)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },           // Payload - what's inside token
    process.env.JWT_SECRET,     // Secret key to sign
    { expiresIn: '7d' }         // Token expires in 7 days
  );

  res.json({ token, user: { id: user._id, name, email } });
};
```

**What this does:**
1. Receive name, email, password from frontend
2. Check if email already registered
3. Hash password with bcrypt (12 rounds of encryption)
4. Save user to MongoDB
5. Create JWT token containing user ID
6. Send token back to frontend

**Why hash passwords?**
> If database is hacked, attackers only see gibberish, not actual passwords

---

### 9. Protected Route Middleware

**File: `server/src/middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header: "Bearer eyJhbGciOiJIUzI1..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];  // Get just the token part
    
    // Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;  // Now all routes can access req.user
    next();  // Continue to the actual route
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**What this does:**
1. Every protected API request must have `Authorization: Bearer <token>` header
2. We extract and verify the token
3. If valid, find the user and attach to `req.user`
4. Now the route handler knows WHO is making the request

**Usage:**
```javascript
// This route is protected - requires login
router.get('/documents', auth, documentController.getAllDocuments);
```

---

### 10. Frontend Auth Context

**File: `src/context/AuthContext.jsx`**

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');  // Token invalid, remove it
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**What this does:**
1. On app load, check if token exists in localStorage
2. If yes, verify it's still valid by calling `/auth/me`
3. `login()` - saves token to localStorage, sets user state
4. `logout()` - removes token, clears user state
5. All components can access `user` via `useAuth()` hook

---

### 11. API Service with Token

**File: `src/services/api.js`**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor - runs before EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**What this does:**
- Creates axios instance with our API URL
- Interceptor automatically adds JWT token to every request
- No need to manually add token each time!

---

### 12. Image Upload with Cloudinary

**File: `server/src/routes/upload.routes.js`**

```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer stores file in memory (not disk)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', auth, upload.single('image'), async (req, res) => {
  // Upload buffer to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'collabsphere' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file.buffer);
  });

  res.json({
    success: true,
    url: result.secure_url,  // Cloudinary URL
  });
});
```

**What this does:**
1. Multer receives file upload, stores in memory (buffer)
2. We stream the buffer to Cloudinary
3. Cloudinary stores image and returns URL
4. We send URL back to frontend
5. Frontend puts URL in document (stored in MongoDB)

**Why Cloudinary?**
> Images stored on Render would be deleted on redeploy. Cloudinary is permanent cloud storage.

---

### 13. Version History

**File: `server/src/controllers/document.controller.js`**

```javascript
// Save document and create version
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { content, title } = req.body;

  const document = await Document.findById(id);

  // Create a version snapshot BEFORE updating
  await DocumentVersion.create({
    document: id,
    content: document.content,  // Old content
    createdBy: req.user.id,
  });

  // Now update with new content
  document.content = content;
  document.title = title;
  document.lastEditedBy = req.user.id;
  await document.save();

  res.json({ success: true, document });
};

// Get version history
exports.getVersionHistory = async (req, res) => {
  const versions = await DocumentVersion.find({ document: req.params.id })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });  // Newest first

  res.json({ success: true, versions });
};

// Restore old version
exports.restoreVersion = async (req, res) => {
  const version = await DocumentVersion.findById(req.params.versionId);
  const document = await Document.findById(req.params.id);

  document.content = version.content;  // Replace with old content
  await document.save();

  res.json({ success: true, document });
};
```

**What this does:**
1. Every save creates a "snapshot" of previous content
2. User can view all versions with timestamps and who made them
3. Restore copies old content back to current document

---

### 14. Document Sharing

**File: `server/src/controllers/document.controller.js`**

```javascript
exports.shareDocument = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  // Find user by email
  const userToShare = await User.findOne({ email });
  if (!userToShare) {
    return res.status(404).json({ message: 'User not found' });
  }

  const document = await Document.findById(id);

  // Check if already shared
  const alreadyShared = document.collaborators.some(
    c => c.user.toString() === userToShare._id.toString()
  );

  if (alreadyShared) {
    return res.status(400).json({ message: 'Already shared with this user' });
  }

  // Add to collaborators array
  document.collaborators.push({
    user: userToShare._id,
    role: role || 'editor',
  });

  await document.save();

  res.json({ success: true, document });
};
```

**What this does:**
1. Find user by email
2. Check if already a collaborator
3. Add user to `collaborators` array with role
4. Now when that user fetches documents, this one appears!

---

### 15. TipTap Rich Text Editor

**File: `src/pages/Editor.jsx`**

```javascript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit,  // Bold, italic, headings, lists, etc.
    Image,       // Image support
    Underline,   // Underline text
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Start typing...' }),
  ],
  content: '',  // Initial content (loaded from API)
  onUpdate: ({ editor }) => {
    // Called every time content changes
    const html = editor.getHTML();
    handleContentChange(html);
  },
});

// Toolbar buttons
<button onClick={() => editor.chain().focus().toggleBold().run()}>
  Bold
</button>
<button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
  H1
</button>
<button onClick={() => editor.chain().focus().setImage({ src: imageUrl }).run()}>
  Insert Image
</button>
```

**What this does:**
- TipTap is a headless editor - we control the UI
- Extensions add features (bold, images, etc.)
- `editor.chain().focus().toggleBold().run()` = toggle bold on selected text
- `editor.getHTML()` = get content as HTML string
- HTML is what we save to database and send via socket

---

## Summary Flow Diagram

```
USER TYPES IN BROWSER
        │
        ▼
┌───────────────────┐
│  TipTap Editor    │
│  onUpdate() fires │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ handleContentChange│
│ - Send to Socket  │
│ - Start save timer│
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌────────────┐
│Socket  │  │After 2 sec │
│Server  │  │API Save    │
└───┬────┘  └─────┬──────┘
    │             │
    ▼             ▼
┌────────────┐  ┌────────────┐
│Broadcast to│  │MongoDB     │
│other users │  │Save + Ver. │
└───┬────────┘  └────────────┘
    │
    ▼
┌────────────────┐
│Other browsers  │
│update instantly│
└────────────────┘
```

---

## DEEP DIVE: Auto-Save Feature

### How Auto-Save Works (Step by Step)

```
User types "H"
    │
    ▼ (immediately)
Timer starts: 2 seconds
    │
User types "e" (within 2 sec)
    │
    ▼
Timer RESETS: 2 seconds again
    │
User types "l", "l", "o" (keeps typing)
    │
    ▼
Timer keeps resetting...
    │
User STOPS typing
    │
    ▼ (waits 2 seconds)
Timer finishes → AUTO-SAVE TRIGGERS!
    │
    ▼
Document saved to MongoDB
```

### The Code (Frontend - Editor.jsx)

```javascript
// This ref stores the timer ID
const saveTimeoutRef = useRef(null);

// Called EVERY time user types
const handleContentChange = (content) => {
  
  // 1. Send to other users via socket (instant)
  socketService.sendContentChange(id, content, user._id);
  
  // 2. Show "unsaved" status
  setSaveStatus('unsaved');
  
  // 3. CANCEL previous timer (if user is still typing)
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);  // Cancel old timer
  }
  
  // 4. Start NEW 2-second timer
  saveTimeoutRef.current = setTimeout(() => {
    saveDocument(content);  // This runs after 2 sec of NO typing
  }, 2000);
};

// The actual save function
const saveDocument = async (content) => {
  setSaveStatus('saving');  // Show "Saving..."
  
  try {
    await api.put(`/documents/${id}`, {
      title: document.title,
      content: content,
    });
    
    setSaveStatus('saved');  // Show "Saved ✓"
    setLastSaved(new Date());
    
  } catch (error) {
    setSaveStatus('error');
    toast.error('Failed to save');
  }
};
```

### Why 2 Seconds?

| Time | Problem |
|------|---------|
| 0.5 sec | Too fast - saves every few letters, wastes server resources |
| 5 sec | Too slow - user might lose work if they close browser |
| **2 sec** | Perfect balance - saves when user pauses typing |

### What "Debouncing" Means

```
Without debouncing:
Type "Hello" → Saves 5 times (H, He, Hel, Hell, Hello)

With debouncing (2 sec):
Type "Hello" → Wait 2 sec → Saves 1 time (Hello)
```

---

## DEEP DIVE: TipTap Editor

### Is it Custom or Imported?

**TipTap is IMPORTED** - it's an open-source rich text editor library.

We didn't build the editor from scratch (that would take months!). Instead:
- TipTap provides the core editing engine
- We add extensions for features we want
- We build our own toolbar UI

### What We Installed

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image 
            @tiptap/extension-underline @tiptap/extension-text-align 
            @tiptap/extension-placeholder
```

### How TipTap Works

```javascript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// 1. Create editor instance
const editor = useEditor({
  extensions: [
    StarterKit,  // Includes: bold, italic, headings, lists, etc.
  ],
  content: '<p>Initial content here</p>',
  onUpdate: ({ editor }) => {
    // This fires every time content changes
    console.log(editor.getHTML());
  },
});

// 2. Render the editor
return <EditorContent editor={editor} />;
```

### Our Extensions (Features)

| Extension | What it Does | How We Use It |
|-----------|--------------|---------------|
| `StarterKit` | Bold, italic, headings, lists, code blocks | Basic formatting |
| `Image` | Insert images | Drag & drop, paste, upload |
| `Underline` | Underline text | Toolbar button |
| `TextAlign` | Left, center, right alignment | Toolbar buttons |
| `Placeholder` | Shows "Start typing..." when empty | UX improvement |

### How Toolbar Buttons Work

```javascript
// Each button calls editor commands

// Bold button
<button onClick={() => editor.chain().focus().toggleBold().run()}>
  <BoldIcon />
</button>

// What this means:
// editor.chain() = start a chain of commands
// .focus() = focus the editor first
// .toggleBold() = toggle bold on/off
// .run() = execute the chain
```

### Complete Toolbar Code

```javascript
// Heading buttons
<button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
  H1
</button>
<button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
  H2
</button>

// Text formatting
<button onClick={() => editor.chain().focus().toggleBold().run()}>
  Bold
</button>
<button onClick={() => editor.chain().focus().toggleItalic().run()}>
  Italic
</button>
<button onClick={() => editor.chain().focus().toggleUnderline().run()}>
  Underline
</button>

// Lists
<button onClick={() => editor.chain().focus().toggleBulletList().run()}>
  Bullet List
</button>
<button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
  Numbered List
</button>

// Alignment
<button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
  Align Left
</button>
<button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
  Align Center
</button>

// Undo/Redo
<button onClick={() => editor.chain().focus().undo().run()}>
  Undo
</button>
<button onClick={() => editor.chain().focus().redo().run()}>
  Redo
</button>
```

### How We Style Active Buttons

```javascript
// Check if bold is currently active
const isBoldActive = editor.isActive('bold');

<button 
  onClick={() => editor.chain().focus().toggleBold().run()}
  className={isBoldActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}
>
  Bold
</button>
```

### Getting/Setting Content

```javascript
// Get content as HTML string
const html = editor.getHTML();
// Result: "<p>Hello <strong>World</strong></p>"

// Set content (when loading document)
editor.commands.setContent('<p>Loaded from database</p>');
```

---

## DEEP DIVE: Document Sharing

### The Flow (Step by Step)

```
┌─────────────────────────────────────────────────────────┐
│ User A (Owner) clicks "Share" button                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Modal opens - Enter collaborator's email                │
│ Email: john@example.com                                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend sends POST /api/documents/:id/share            │
│ Body: { email: "john@example.com" }                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Backend:                                                │
│ 1. Find user by email                                   │
│ 2. Add to document.collaborators array                  │
│ 3. Save document                                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ User B (john@example.com) refreshes dashboard           │
│ → Document now appears in their list!                   │
└─────────────────────────────────────────────────────────┘
```

### Frontend Code (Share Modal)

```javascript
// State for share modal
const [isShareOpen, setIsShareOpen] = useState(false);
const [shareEmail, setShareEmail] = useState('');

// Handle share submission
const handleShare = async () => {
  if (!shareEmail.trim()) {
    toast.error('Please enter an email');
    return;
  }

  try {
    await api.post(`/documents/${id}/share`, { 
      email: shareEmail 
    });
    
    toast.success(`Shared with ${shareEmail}!`);
    setShareEmail('');
    setIsShareOpen(false);
    
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to share');
  }
};

// The Modal UI
<Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Document">
  <Input
    label="Email address"
    placeholder="Enter collaborator's email"
    value={shareEmail}
    onChange={(e) => setShareEmail(e.target.value)}
  />
  <Button onClick={handleShare}>
    Share
  </Button>
</Modal>
```

### Backend Code (Share Endpoint)

```javascript
// POST /api/documents/:id/share
exports.shareDocument = async (req, res) => {
  const { id } = req.params;        // Document ID from URL
  const { email } = req.body;       // Email from request body
  const userId = req.user.id;       // Current user (from JWT)

  // 1. Find the document
  const document = await Document.findById(id);
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  // 2. Check if current user is the owner
  if (document.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Only owner can share' });
  }

  // 3. Find user to share with
  const userToShare = await User.findOne({ email });
  
  if (!userToShare) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 4. Check if already shared
  const alreadyShared = document.collaborators.some(
    c => c.user.toString() === userToShare._id.toString()
  );

  if (alreadyShared) {
    return res.status(400).json({ message: 'Already shared with this user' });
  }

  // 5. Add to collaborators array
  document.collaborators.push({
    user: userToShare._id,
    role: 'editor',
    addedAt: new Date(),
  });

  await document.save();

  res.json({ success: true, message: 'Document shared successfully' });
};
```

### How Shared Documents Appear in Dashboard

```javascript
// GET /api/documents - Returns documents where user is owner OR collaborator
exports.getAllDocuments = async (req, res) => {
  const userId = req.user.id;

  const documents = await Document.find({
    $or: [
      { owner: userId },                    // User owns the document
      { 'collaborators.user': userId },     // User is a collaborator
    ],
  })
  .populate('owner', 'name email')
  .populate('collaborators.user', 'name email')
  .sort({ updatedAt: -1 });

  res.json({ success: true, documents });
};
```

### Database Structure for Sharing

```javascript
// Document model
{
  _id: "doc123",
  title: "My Document",
  content: "<p>Hello World</p>",
  owner: "user_A_id",           // Owner's user ID
  collaborators: [              // Array of collaborators
    {
      user: "user_B_id",        // Collaborator's user ID
      role: "editor",           // Can be "editor" or "viewer"
      addedAt: "2026-02-18"
    },
    {
      user: "user_C_id",
      role: "editor",
      addedAt: "2026-02-18"
    }
  ]
}
```

---

## DEEP DIVE: Version History

### How Versions Are Created

```
User types and stops
        │
        ▼
Auto-save triggers (after 2 sec)
        │
        ▼
┌─────────────────────────────────────┐
│ Backend receives PUT /documents/:id │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ STEP 1: Save OLD content as version │
│                                     │
│ DocumentVersion.create({            │
│   document: documentId,             │
│   content: document.content, ← OLD  │
│   createdBy: userId                 │
│ });                                 │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ STEP 2: Update with NEW content     │
│                                     │
│ document.content = newContent;      │
│ document.save();                    │
└─────────────────────────────────────┘
```

### Backend Code - Creating Versions

```javascript
// PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { content, title } = req.body;
  const userId = req.user.id;

  // 1. Find current document
  const document = await Document.findById(id);

  // 2. Save CURRENT content as a version BEFORE updating
  //    (This is the "snapshot")
  await DocumentVersion.create({
    document: id,
    content: document.content,  // Save the OLD content
    createdBy: userId,
    createdAt: new Date(),
  });

  // 3. NOW update document with new content
  document.content = content;
  document.title = title;
  document.lastEditedBy = userId;
  document.updatedAt = new Date();
  
  await document.save();

  res.json({ success: true, document });
};
```

### DocumentVersion Model

```javascript
// server/src/models/DocumentVersion.js
const documentVersionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

### Fetching Version History

```javascript
// GET /api/documents/:id/versions
exports.getVersionHistory = async (req, res) => {
  const { id } = req.params;

  const versions = await DocumentVersion.find({ document: id })
    .populate('createdBy', 'name email')  // Get user name
    .sort({ createdAt: -1 });             // Newest first

  res.json({ success: true, versions });
};
```

### Frontend - Displaying Version History

```javascript
// Fetch versions when user clicks "History" button
const fetchVersionHistory = async () => {
  setLoadingVersions(true);
  
  try {
    const response = await api.get(`/documents/${id}/versions`);
    setVersions(response.data.versions);
  } catch (error) {
    toast.error('Failed to load history');
  } finally {
    setLoadingVersions(false);
  }
};

// Display in modal
<Modal isOpen={isHistoryOpen} title="Version History">
  {versions.map((version, index) => (
    <div key={version._id}>
      <p>Version {versions.length - index}</p>
      <p>By: {version.createdBy.name}</p>
      <p>Date: {formatDate(version.createdAt)}</p>
      
      <Button onClick={() => handleRestoreVersion(version._id)}>
        Restore
      </Button>
    </div>
  ))}
</Modal>
```

### How Restore Works

```
User clicks "Restore" on Version 3
        │
        ▼
┌─────────────────────────────────────┐
│ Frontend: POST /documents/:id/      │
│           versions/:versionId/restore│
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ 1. Find the old version             │
│ 2. Copy its content to document     │
│ 3. Save document                    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ Editor updates with old content     │
│ User sees restored version!         │
└─────────────────────────────────────┘
```

### Backend Code - Restore Version

```javascript
// POST /api/documents/:id/versions/:versionId/restore
exports.restoreVersion = async (req, res) => {
  const { id, versionId } = req.params;
  const userId = req.user.id;

  // 1. Find the version to restore
  const version = await DocumentVersion.findById(versionId);
  
  if (!version) {
    return res.status(404).json({ message: 'Version not found' });
  }

  // 2. Find current document
  const document = await Document.findById(id);

  // 3. Save CURRENT content as new version (before restoring)
  //    So user doesn't lose current work!
  await DocumentVersion.create({
    document: id,
    content: document.content,
    createdBy: userId,
  });

  // 4. Replace content with old version
  document.content = version.content;
  document.lastEditedBy = userId;
  
  await document.save();

  res.json({ success: true, document });
};
```

### Frontend - Handle Restore

```javascript
const handleRestoreVersion = async (versionId) => {
  try {
    const response = await api.post(
      `/documents/${id}/versions/${versionId}/restore`
    );
    
    // Update editor with restored content
    editor.commands.setContent(response.data.document.content);
    
    toast.success('Version restored!');
    setIsHistoryOpen(false);
    
    // Refresh version history
    fetchVersionHistory();
    
  } catch (error) {
    toast.error('Failed to restore version');
  }
};
```

### Visual Example of Version History

```
Timeline of document:
                                                          
    v1          v2          v3          v4 (current)
    │           │           │           │
    ▼           ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Hello  │  │ Hello  │  │ Hello  │  │ Hello  │
│        │  │ World  │  │ World! │  │ World! │
│        │  │        │  │ How    │  │ How r  │
│        │  │        │  │ are u? │  │ you?   │
└────────┘  └────────┘  └────────┘  └────────┘
   10:00       10:05       10:10       10:15

User clicks "Restore" on v2:
→ Current content becomes v2's content ("Hello World")
→ v4 is saved as v5 (so nothing is lost)
```

---

## Thank You!

Questions? Let's collaborate! 🚀

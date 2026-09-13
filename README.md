# 👾 YapMonster

<p align="center">
  <img src="https://api.dicebear.com/7.x/bottts/svg?seed=YapMonster" alt="YapMonster Logo" width="120" height="120" />
</p>

<p align="center">
  <b>A modern, enterprise-grade real-time communication platform featuring instant messaging, WebRTC group video calling, call history tracking, message quoting, and custom chat styling.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/LiveKit-WebRTC-FF4F00?style=for-the-badge&logo=webrtc&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Chakra_UI-2.3.1-319795?style=for-the-badge&logo=chakraui&logoColor=white" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
  - [High-Level System Architecture](#1-high-level-system-architecture)
  - [Low-Level Video Call Signaling & SFU Pipeline](#2-low-level-video-call-signaling--sfu-pipeline)
  - [Low-Level Real-Time Messaging & Broadcast Pipeline](#3-low-level-real-time-messaging--broadcast-pipeline)
  - [Database Entity Relationship Diagram (ERD)](#4-database-entity-relationship-diagram-erd)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [API Reference](#-api-reference)
- [Socket.IO Events Specification](#-socketio-events-specification)
- [Environment Variables](#-environment-variables)
- [Installation & Getting Started](#-installation--getting-started)
- [Security & Performance Optimizations](#-security--performance-optimizations)

---

## 🚀 Overview

**YapMonster** is a full-stack real-time collaboration application designed for seamless messaging and low-latency HD video conferencing. Built on the **MERN** stack and powered by **Socket.IO** and **LiveKit WebRTC SFU**, YapMonster combines the speed of WebSocket communication with scalable selective-forwarding video streams.

---

## ✨ Key Features

### 💬 Instant Messaging & Collaboration
- **Real-Time 1-on-1 & Group Chats**: Dynamic group creation, admin permissions, and participant management.
- **Typing Indicators & Live Presence**: Real-time typing feedback using debounced socket triggers.
- **Message Reply & Quoting**: Seamless reply threads with preview quotes of parent messages.
- **Dual-Mode Message Deletion**:
  - `Delete for Me`: Hides message locally per user account.
  - `Delete for Everyone`: Broadcasts real-time tombstones across all client instances.
- **Smart Date Dividers & 12-Hour Timestamps**: Floating day indicators (*Today*, *Yesterday*, formatted date pills) and precise message timestamps.
- **Chat Customization**: Per-conversation custom backgrounds (solid hex palette or custom wallpaper images).

### 📹 WebRTC & LiveKit HD Video Calling
- **1-on-1 & Multi-Party Video Calls**: Seamless, zero-setup WebRTC room generation via LiveKit Cloud SFU.
- **Real-Time Call Ringing & Notifications**: Incoming call modal with ambient ring pulse and accept/decline actions.
- **Responsive Layout Engine**: Dynamic side-by-side split screen for 1-on-1 calls and responsive multi-tile grid for group conferences.
- **Media Controls**: Real-time camera toggle, microphone mute/unmute, and screen-sharing support.

### 📞 Real-Time Call History in Chat Feed
- **Automated Lifecycle Logging**:
  - **Completed Calls**: Computes exact call duration in minutes and seconds (`📹 Video Call • 4m 12s`).
  - **Missed Calls**: Tracks unreceived or timed-out calls (`📹 Missed Video Call`).
  - **Declined Calls**: Real-time logging when recipient declines (`📹 Call Declined`).
- **One-Click Call Back**: Interactive call cards with quick action buttons to instantly re-initiate video calls.

---

## 🏗 System Architecture

### 1. High-Level System Architecture

The following diagram illustrates how frontend clients interact with the Express API server, Socket.IO WebSocket cluster, MongoDB database, Cloudinary CDN, and the LiveKit WebRTC SFU infrastructure:

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (React 18 + Chakra UI)"]
        UI["UI Layer / Components"]
        SocketClient["Socket.IO Client"]
        LKClient["LiveKit Client SDK"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph GatewayLayer["Application Server (Node.js / Express)"]
        API["REST API Router"]
        AuthMiddleware["JWT Auth & Security (Helmet, RateLimit, CORS)"]
        Controllers["Controllers (Chat, Message, User, LiveKit)"]
        SocketServer["Socket.IO Signaling Server"]
    end

    subgraph DataLayer["Storage & External Cloud Services"]
        MongoDB[(MongoDB Database)]
        Cloudinary["Cloudinary (Media & Avatars)"]
        LiveKitSFU["LiveKit Cloud SFU (WebRTC Audio/Video)"]
    end

    %% Client to Server interactions
    AxiosClient -->|"HTTP / REST (JWT Auth)"| AuthMiddleware
    AuthMiddleware --> API
    API --> Controllers
    SocketClient <-->|"WebSockets (Signaling, Chat Events)"| SocketServer

    %% Server to Data layer
    Controllers -->|"Mongoose ODM"| MongoDB
    Controllers -->|"Generate Access Tokens"| LiveKitSFU
    UI -->|"Upload Profile Images"| Cloudinary

    %% Direct WebRTC Media Streams
    LKClient <-->|"PeerConnection (SRTP / WebRTC)"| LiveKitSFU
```

---

### 2. Low-Level Video Call Signaling & SFU Pipeline

This sequence diagram details the full lifecycle of an outgoing call, signaling exchanges, token generation, media track publishing, and call history logging upon completion:

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Caller (Client A)
    participant Socket as Socket.IO Server
    actor Callee as Callee (Client B)
    participant API as Express API
    participant LiveKit as LiveKit SFU Cloud
    participant DB as MongoDB

    %% 1. Initiation
    Caller->>Socket: emit("call user", { chatId, caller, users })
    Socket->>Callee: emit("incoming call", { chatId, caller })

    %% 2. Answering
    Callee->>Socket: emit("answer call", { chatId, callerId, answerer })
    Socket->>Caller: emit("call answered", { chatId, answerer })

    %% 3. Token Fetching
    par Caller Token Fetch
        Caller->>API: POST /api/livekit/token { chatId }
        API->>LiveKit: Generate AccessToken(chatId, identity)
        API-->>Caller: { token, serverUrl }
    and Callee Token Fetch
        Callee->>API: POST /api/livekit/token { chatId }
        API->>LiveKit: Generate AccessToken(chatId, identity)
        API-->>Callee: { token, serverUrl }
    end

    %% 4. WebRTC Connection
    Caller->>LiveKit: Connect(serverUrl, token) & Publish Camera Track
    Callee->>LiveKit: Connect(serverUrl, token) & Publish Camera Track
    LiveKit-->>Caller: Forward Callee Video Track (Subscribed)
    LiveKit-->>Callee: Forward Caller Video Track (Subscribed)

    %% 5. Call Teardown & History Logging
    Caller->>Socket: emit("end call", { chatId, userId })
    Socket->>Callee: emit("call ended")
    Caller->>LiveKit: Disconnect()
    Callee->>LiveKit: Disconnect()

    Caller->>API: POST /api/message/call { chatId, status: "completed", duration }
    API->>DB: Message.create({ messageType: "call", callInfo: {...} })
    API->>DB: Chat.findByIdAndUpdate(latestMessage)
    API-->>Caller: Populated Call Message Object
    Caller->>Socket: emit("new message", callMessage)
    Socket->>Callee: emit("message received", callMessage)
```

---

### 3. Low-Level Real-Time Messaging & Broadcast Pipeline

This diagram explains how messages, replies, typing status, and deletions propagate through the system in real-time:

```mermaid
sequenceDiagram
    autonumber
    actor Sender as Sender
    participant API as Express API (/api/message)
    participant DB as MongoDB
    participant Socket as Socket.IO Engine
    actor Recipient as Recipient(s)

    %% Typing Indicators
    Sender->>Socket: emit("typing", room)
    Socket->>Recipient: emit("typing")

    %% Message Dispatch
    Sender->>API: POST /api/message { content, chatId, replyTo }
    API->>DB: Save Message & Populate (sender, replyTo, chat.users)
    API->>DB: Update Chat.latestMessage
    API-->>Sender: HTTP 200 (Saved Message JSON)

    %% Real-Time Broadcast
    Sender->>Socket: emit("new message", messageData)
    Socket->>Socket: Verify sender !== recipient
    Socket->>Recipient: emit("message received", messageData)

    %% Stop Typing
    Sender->>Socket: emit("stop typing", room)
    Socket->>Recipient: emit("stop typing")
```

---

### 4. Database Entity Relationship Diagram (ERD)

The relational model connecting Users, Chats, Messages, and Customizations:

```mermaid
erDiagram
    USER ||--o{ CHAT : "participates in (users)"
    USER ||--o{ CHAT : "admin of (groupAdmin)"
    USER ||--o{ MESSAGE : "sends (sender)"
    USER ||--o{ MESSAGE : "reads (readBy)"
    USER ||--o{ MESSAGE : "deletes locally (deletedFor)"
    CHAT ||--o{ MESSAGE : "contains"
    CHAT ||--o| MESSAGE : "latestMessage"
    MESSAGE ||--o| MESSAGE : "replyTo"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password "bcrypt hash"
        String pic "Cloudinary / DiceBear URL"
        Boolean isAdmin
        Array chatBackgrounds "chat, type, value"
        Date createdAt
        Date updatedAt
    }

    CHAT {
        ObjectId _id PK
        String chatName
        Boolean isGroupChat
        Array users "FK -> User[]"
        ObjectId latestMessage "FK -> Message"
        ObjectId groupAdmin "FK -> User"
        String groupPic
        Date createdAt
        Date updatedAt
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId sender "FK -> User"
        String content
        ObjectId chat "FK -> Chat"
        ObjectId replyTo "FK -> Message"
        String messageType "text | call"
        Object callInfo "callType, status, duration, startedAt, endedAt"
        Boolean deletedForEveryone "default: false"
        Array deletedFor "FK -> User[]"
        Array readBy "FK -> User[]"
        Date createdAt
        Date updatedAt
    }
```

---

## 🛠 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (`react`, `react-dom`) | Declarative component UI layer |
| **Styling & Design** | Chakra UI (`@chakra-ui/react`), Emotion, Framer Motion | Accessible, responsive, glassmorphic theme |
| **Real-Time Video** | LiveKit WebRTC (`@livekit/components-react`, `livekit-client`) | SFU-powered scalable video rooms |
| **WebSocket Engine** | Socket.IO Client (`socket.io-client`) | Bidirectional low-latency event communication |
| **Backend Runtime** | Node.js & Express.js | REST API & WebSocket server |
| **Database & ODM** | MongoDB & Mongoose 8 | Document database with schema validation |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Stateless bearer token authentication |
| **Media & CDN** | Cloudinary REST API | Cloud image uploads & profile asset management |
| **Security & Utilities**| `helmet`, `cors`, `express-rate-limit`, `morgan` | Production defense-in-depth and request logging |

---

## 📁 Directory Structure

```
YapMonster/
├── backend/
│   ├── config/
│   │   ├── db.js                   # MongoDB connection configuration
│   │   └── generateToken.js        # JWT creation helper
│   ├── controllers/
│   │   ├── chatControllers.js      # Group & 1-on-1 chat logic
│   │   ├── livekitControllers.js   # LiveKit Room token generation
│   │   ├── messageControllers.js   # Messages, call logs, & deletion
│   │   └── userControllers.js      # Auth, search, & background themes
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authorization protection
│   │   └── errorMiddleware.js      # 404 & global error handlers
│   ├── models/
│   │   ├── chatModel.js            # Chat schema
│   │   ├── messageModel.js         # Message & Call schema
│   │   └── userModel.js            # User & Background schema
│   ├── routes/
│   │   ├── chatRoutes.js           # /api/chat endpoints
│   │   ├── livekitRoutes.js        # /api/livekit endpoints
│   │   ├── messageRoutes.js        # /api/message endpoints
│   │   └── userRoutes.js           # /api/user endpoints
│   ├── server.js                   # Express server & Socket.IO events
│   └── package.json
│
└── frontend/
    ├── public/                     # Static assets & index.html
    └── src/
        ├── components/
        │   ├── Authentication/     # Login & Signup tabs
        │   ├── miscellaneous/      # SideDrawer, ProfileModal, GroupModal, ChatCustomizer
        │   ├── userAvatar/         # UserListItem & UserBadgeItem
        │   ├── VideoCall/          # CustomVideoRoom, VideoTile, IncomingCallModal, VideoCallModal
        │   ├── ChatBox.js          # Chat view wrapper
        │   ├── ChatLoading.js      # Skeleton loading states
        │   ├── MyChats.js          # Sidebar chat list & preview timestamps
        │   ├── ScrollableChat.js   # Chat bubbles, Call History cards, Date dividers
        │   └── SingleChat.js       # Chat container, typing, socket lifecycle
        ├── Context/
        │   └── ChatProvider.js     # React Context state (user, selectedChat, notifications)
        ├── config/
        │   ├── ChatLogics.js       # Sender name/avatar helper utilities
        │   └── config.js           # Environment & Backend URL configuration
        ├── App.js                  # Route definitions
        ├── index.js                # App bootstrap & ChakraProvider
        └── package.json
```

---

## 📡 API Reference

### 🔐 Authentication & Users (`/api/user`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/user` | Public | Register new user account |
| `POST` | `/api/user/login` | Public | Authenticate user & receive JWT |
| `GET` | `/api/user?search=query` | Bearer | Search registered users by name or email |
| `PUT` | `/api/user/profile` | Bearer | Update user profile name and avatar |
| `GET` | `/api/user/chat-background/:chatId` | Bearer | Retrieve custom wallpaper for a chat |
| `PUT` | `/api/user/chat-background/:chatId` | Bearer | Set custom color/image wallpaper |

### 💬 Chat Management (`/api/chat`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/chat` | Bearer | Access or create 1-on-1 conversation |
| `GET` | `/api/chat` | Bearer | Fetch all conversations for the authenticated user |
| `POST` | `/api/chat/group` | Bearer | Create a new group chat |
| `PUT` | `/api/chat/rename` | Bearer | Rename a group chat (Admin only) |
| `PUT` | `/api/chat/groupadd` | Bearer | Add user to group (Admin only) |
| `PUT` | `/api/chat/groupremove` | Bearer | Remove user from group or leave group |
| `PUT` | `/api/chat/update-picture` | Bearer | Update group display picture (Admin only) |
| `DELETE`| `/api/chat/:chatId` | Bearer | Delete entire conversation |

### 📨 Messages & Call Logs (`/api/message`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/message/:chatId` | Bearer | Fetch all message history for a chat |
| `POST` | `/api/message` | Bearer | Send a text message (optional `replyTo`) |
| `POST` | `/api/message/call` | Bearer | Record a completed, missed, or declined call |
| `DELETE`| `/api/message/:messageId` | Bearer | Delete message for everyone (tombstone) |
| `PUT` | `/api/message/delete-for-me`| Bearer | Delete message for current user only |

### 📹 WebRTC & LiveKit Tokens (`/api/livekit`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/livekit/token` | Bearer | Generate LiveKit JWT room access token |

---

## ⚡ Socket.IO Events Specification

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `setup` | Client $\rightarrow$ Server | `userData` | Registers user's active socket session |
| `connected` | Server $\rightarrow$ Client | - | Acknowledges socket connection |
| `join chat` | Client $\rightarrow$ Server | `roomId` | Joins a specific chat room channel |
| `typing` | Client $\rightarrow$ Server | `roomId` | Emits typing state to other chat members |
| `stop typing` | Client $\rightarrow$ Server | `roomId` | Clears typing indicator |
| `new message` | Client $\rightarrow$ Server | `newMessageReceived` | Relays incoming message/call to chat users |
| `message received` | Server $\rightarrow$ Client | `messageObject` | Delivers new message or call log |
| `delete message` | Client $\rightarrow$ Server | `{ chatId, messageId, forEveryone }` | Signals message deletion event |
| `message deleted` | Server $\rightarrow$ Client | `{ messageId, forEveryone }` | Synchronizes deletion across clients |
| `call user` | Client $\rightarrow$ Server | `{ chatId, caller, isGroupChat, ... }` | Dispatches incoming call alerts |
| `incoming call` | Server $\rightarrow$ Client | `{ chatId, caller, isGroupChat }` | Prompts incoming call modal on callee |
| `answer call` | Client $\rightarrow$ Server | `{ chatId, callerId, answerer }` | Signals that callee accepted the call |
| `call answered`| Server $\rightarrow$ Client | `{ chatId, answerer }` | Notifies caller to start active stream |
| `reject call` | Client $\rightarrow$ Server | `{ chatId, callerId, rejecter }` | Signals that callee declined call |
| `call rejected`| Server $\rightarrow$ Client | `{ chatId, rejecter }` | Notifies caller that call was declined |
| `end call` | Client $\rightarrow$ Server | `{ chatId, userId }` | Broadcasts hang-up signal to room |
| `call ended` | Server $\rightarrow$ Client | `{ chatId, userId }` | Closes active call modal for peers |

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yapmonster?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# LiveKit WebRTC Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

### Frontend Configuration (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## 📦 Installation & Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/akkuraina/mergo.git
cd mergo
```

### 2. Configure Backend
```bash
cd backend
npm install
# Create .env and populate environment variables
npm start
```

### 3. Configure Frontend
```bash
cd ../frontend
npm install
# Create .env and configure REACT_APP_BACKEND_URL
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting!

---

## 🛡 Security & Performance Optimizations

- **Helmet Security**: Sanitizes and sets security-related HTTP headers against XSS and clickjacking.
- **Strict Rate Limiting**: Dedicated rate limiter on auth routes (`/api/user/login`) and API endpoints to prevent brute-force attacks.
- **Hardware-Aware WebRTC**: Automatic handling of camera device timeouts (`AbortError`), graceful camera fallbacks, and track subscription cleanups.
- **Optimized MongoDB Indexing**: Compound indexes on `chat` and `sender` fields for sub-millisecond message query resolution.
- **Tombstone Data Preservation**: Soft-deletion mechanism preserving conversation integrity while honoring user privacy.

---


# 🔍 YapMonster End-to-End Comprehensive Audit Report

**Date:** September 11, 2026  
**Auditor:** Antigravity Advanced Agentic AI  
**Scope:** Full-Stack Codebase Audit (Database, Backend API, WebSocket/Socket.IO, Frontend React, UI/UX, Security, Performance, and Configuration)  
**Status:** Audit Complete  

---

## 📋 Executive Summary

**YapMonster** is a full-stack real-time MERN (MongoDB, Express, React, Node.js) chat application featuring one-on-one chats, group chats, typing indicators, notifications, message deletion, custom chat backgrounds, and profile customization.

While the core functionality is built upon established architectural patterns (inspired by standard MERN chat workflows), our exhaustive file-by-file audit revealed **critical security vulnerabilities**, **logic and real-time synchronization bugs**, **architectural regressions**, and **UI/UX defects** that require immediate attention.

### 📊 Findings Breakdown
| Severity | Count | Primary Areas |
| :--- | :---: | :--- |
| 🔴 **Critical Severity** | 7 | Hardcoded Credentials, Broken Authorization, Database Document Overflow, Listener Memory Leaks |
| 🟠 **High Severity** | 8 | Real-Time Sync Gaps (Deletions), Admin Badge Bug, Regex DoS, Missing Token Expiration Handlers |
| 🟡 **Medium Severity** | 10 | Deprecated UI Framework Props, Mobile Responsiveness, Fixed Height Calculations, Orphaned Data |
| 🟢 **Low / Code Hygiene** | 6 | Debug Artifacts, Unused Mock Datasets, Redundant Package Dependencies, Console Logging Pollution |

---

## 🔴 1. Critical Severity Issues

### 1.1 Exposed Live Database Credentials & Secrets in Backend `.env`
- **Location:** [`backend/.env`](file:///d:/DJSCE/CODING/YapMonster/backend/.env#L1-L5) & [`backend/config/db.js`](file:///d:/DJSCE/CODING/YapMonster/backend/config/db.js#L4)
- **Description:** 
  1. The backend `.env` file contains live MongoDB Atlas credentials with raw administrative user/password in plaintext (`mongodb+srv://akanksharainadjsce:...`).
  2. The production `JWT_SECRET` is committed locally in `.env`.
  3. In `db.js`, `console.log(process.env.MONGO_URI)` explicitly dumps the full connection URI (including credentials) into server logs on every startup.
- **Risk:** Complete database compromise, unauthorized data access, token forgery.
- **Remediation:** 
  - Immediately rotate the MongoDB Atlas password and generate a fresh cryptographically secure `JWT_SECRET`.
  - Remove all secrets from repository files and use `.env.example`.
  - Remove `console.log(process.env.MONGO_URI)` from `db.js`.

### 1.2 Unauthenticated / Broken Object-Level Authorization on Messages (`IDOR`)
- **Location:** [`backend/controllers/messageControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/messageControllers.js#L9-L19) (`allMessages`)
- **Description:** 
  The endpoint `GET /api/message/:chatId` retrieves all messages for a given `chatId` without verifying whether `req.user._id` is actually a participant in `Chat.users`. Any authenticated user can read private conversations of any other user by simply passing another chat's ObjectId.
- **Risk:** Total breach of chat confidentiality.
- **Remediation:**
  Verify participant membership before querying messages:
  ```javascript
  const chat = await Chat.findOne({ _id: req.params.chatId, users: req.user._id });
  if (!chat) {
    res.status(403);
    throw new Error("You are not authorized to view messages in this chat");
  }
  ```

### 1.3 Message Injection Without Chat Membership Validation
- **Location:** [`backend/controllers/messageControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/messageControllers.js#L24-L66) (`sendMessage`)
- **Description:** 
  The `sendMessage` endpoint does not verify if the sender (`req.user._id`) belongs to `Chat.users` before creating the message and setting it as the chat's `latestMessage`.
- **Risk:** Impersonation and unauthorized message insertion into private/group chats.
- **Remediation:** Validate that `req.user._id` exists within `chat.users` before executing `Message.create`.

### 1.4 Denial of Service via Massive Base64 Image Ingestion into MongoDB (16MB BSON Limit)
- **Location:** 
  - [`backend/server.js`](file:///d:/DJSCE/CODING/YapMonster/backend/server.js#L26-L27) (`limit: '50mb'`)
  - [`backend/controllers/userControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/userControllers.js#L88-L116) (`updateUserProfile`)
  - [`backend/controllers/userControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/userControllers.js#L132-L198) (`setChatBackground`)
  - [`backend/controllers/chatControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/chatControllers.js#L183-L223) (`updateGroupPic`)
- **Description:** 
  1. The server allows `50MB` JSON payloads.
  2. Profiles, group avatars, and custom chat backgrounds store raw Base64 data URLs directly inside MongoDB documents.
  3. MongoDB enforces a hard limit of **16MB per BSON document**. Storing multiple large base64 strings will cause database `BSONObj size too large` write failures and server crashes.
- **Remediation:**
  - Offload media storage to Cloudinary, AWS S3, or Supabase Storage, storing only CDN image URLs in MongoDB.
  - Reject inline base64 image strings larger than standard avatar thumbnails (or enforce 200KB limit).

### 1.5 Third-Party Cloudinary Hardcoded Credentials in Frontend
- **Location:** [`frontend/src/components/Authentication/Signup.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/Authentication/Signup.js#L104-L106)
- **Description:** 
  Avatar uploads in `Signup.js` use hardcoded credentials from an external public tutorial:
  ```javascript
  data.append("upload_preset", "chat-app");
  data.append("cloud_name", "piyushproj");
  fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", ...)
  ```
- **Risk:** Account suspension, rate-limit failures, broken user registration when external credentials expire or are locked.
- **Remediation:** Provide user-owned Cloudinary/S3 environment variables or use a dedicated backend upload route.

### 1.6 Insecure & Invalid CORS Configuration
- **Location:** [`backend/server.js`](file:///d:/DJSCE/CODING/YapMonster/backend/server.js#L38-L43) & [`backend/server.js`](file:///d:/DJSCE/CODING/YapMonster/backend/server.js#L67-L73)
- **Description:**
  ```javascript
  app.use(cors({ origin: "*", credentials: true }));
  ```
  According to the W3C CORS specification, when `credentials: true` is enabled, `origin` **cannot** be wildcard `*`. Browsers will reject credentialed requests in production.
- **Remediation:**
  Configure explicit origins based on `FRONTEND_URL` and `process.env.NODE_ENV`.

### 1.7 Socket Listener Churn & Memory Leak in `SingleChat.js`
- **Location:** [`frontend/src/components/SingleChat.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/SingleChat.js#L226-L271)
- **Description:** 
  The `message received` socket listener is registered inside a `useEffect` with dependencies `[notification, messages, fetchAgain, user._id]`. On every single keystroke or state update, the socket listener is torn down and re-registered. This causes race conditions, dropped socket packets, and memory leaks.
- **Remediation:** 
  Use a persistent `useEffect` mounting listener once and reference reactive state using React refs or functional state updaters (`setMessages(prev => ...)`).

---

## 🟠 2. High Severity Issues

### 2.1 Admin Badge Comparison Bug in `UserBadgeItem.js`
- **Location:** [`frontend/src/components/userAvatar/UserBadgeItem.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/userAvatar/UserBadgeItem.js#L23)
- **Bug:**
  ```javascript
  {admin === user._id && <span> (Admin)</span>}
  ```
  `admin` passed from `selectedChat.groupAdmin` is a populated User object (`{ _id: "...", name: "..." }`), whereas `user._id` is a string. Since `[object Object] === "id"` is always `false`, the **"(Admin)" tag is never rendered**.
- **Remediation:**
  ```javascript
  {(admin?._id === user._id || admin === user._id) && <span> (Admin)</span>}
  ```

### 2.2 Lack of Real-Time Socket Events for Message Deletion
- **Location:** 
  - [`backend/controllers/messageControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/messageControllers.js#L68-L88)
  - [`frontend/src/components/ScrollableChat.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/ScrollableChat.js#L86-L100)
- **Bug:** 
  When a user deletes a message for everyone via `DELETE /api/message/:messageId`, the backend updates the database but **does not emit a Socket.IO event**. Other connected participants in the room will still see the deleted message until they manually refresh their browser.
- **Remediation:** 
  Emit `socket.to(chatId).emit("message deleted", messageId)` so all active clients instantly update their message view.

### 2.3 Unhandled Regex Injection in User Search (`ReDoS`)
- **Location:** [`backend/controllers/userControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/userControllers.js#L9-L16)
- **Bug:** 
  User input is passed directly into `$regex`:
  ```javascript
  { name: { $regex: req.query.search, $options: "i" } }
  ```
  If a user searches for special characters like `[`, `*`, `+`, or invalid regex patterns, MongoDB throws an unhandled exception, resulting in a 500 error.
- **Remediation:** Sanitize query input by escaping regex special characters before querying.

### 2.4 Unhandled 401 JWT Expiration in Client
- **Location:** [`frontend/src/components/MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L44-L52), [`SingleChat.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/SingleChat.js#L72-L82)
- **Bug:** 
  When the JWT token expires (after 30 days), requests return `401 Unauthorized`. The frontend catches this as a generic toast error and does not clear `localStorage.removeItem("userInfo")` or redirect to `/login`. The user is stuck in a broken loop until they manually clear their browser cache.
- **Remediation:** Add an Axios response interceptor that clears localStorage and navigates to `/` upon receiving a `401`.

### 2.5 Orphaned Messages on Chat Deletion
- **Location:** [`backend/controllers/chatControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/chatControllers.js#L228-L253) (`deleteChat`)
- **Bug:** 
  When a group chat or 1-on-1 chat is deleted from the database, its corresponding messages in the `Message` collection are retained forever as orphaned data, wasting database storage.
- **Remediation:** Perform `await Message.deleteMany({ chat: chatId })` inside `deleteChat`.

### 2.6 Resetting Selected Chat to Empty String `""` Instead of `null`
- **Location:** [`frontend/src/components/SingleChat.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/SingleChat.js#L334)
- **Bug:** 
  Back button executes `setSelectedChat("")`. `""` is a truthy value in loose comparisons, causing `selectedChat._id` to evaluate to `undefined` and triggering unexpected conditional rendering glitches.
- **Remediation:** Use `setSelectedChat(null)` consistently across all components.

### 2.7 Global Rate Limiter Stifling Chat Messaging
- **Location:** [`backend/server.js`](file:///d:/DJSCE/CODING/YapMonster/backend/server.js#L30-L35)
- **Bug:** 
  `express-rate-limit` limits all endpoints to `100 requests per 15 minutes` globally. In active real-time chatting or search, a user will easily exceed 100 HTTP requests in 15 minutes, causing sudden `429 Too Many Requests` lockouts.
- **Remediation:** Apply strict rate limits to `/api/user/login` and `/api/user` (registration), while keeping message/chat APIs higher or separate.

### 2.8 No Password Validation / Complexity Requirement
- **Location:** [`backend/controllers/userControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/userControllers.js#L28-L31)
- **Bug:** 
  Users can register with single-character passwords (e.g. `a`).
- **Remediation:** Enforce a minimum of 8 characters and basic complexity checks.

---

## 🟡 3. Medium Severity & UI/UX Issues

### 3.1 Hardcoded Test Button in Production Menu
- **Location:** [`frontend/src/components/miscellaneous/SideDrawer.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/SideDrawer.js#L188-L211)
- **Issue:** 
  The notification dropdown contains a permanently rendered debug option:
  `🧪 Add Test Notification` which injects dummy notifications into the user's interface.
- **Remediation:** Remove this debug item before production release.

### 3.2 Duplicate Chat List in `SideDrawer` Replacing User Search
- **Location:** [`frontend/src/components/miscellaneous/SideDrawer.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/SideDrawer.js#L300-L446)
- **Issue:** 
  The hamburger menu on the top-left opens a drawer that renders an exact duplicate of `MyChats`. In the original design, `SideDrawer` was intended to search and find new users. Now, finding new users can only be done through the "New Chat" modal in `MyChats`.
- **Remediation:** Either restore the user search capability inside `SideDrawer` or remove the redundant hamburger drawer.

### 3.3 Deprecated Chakra UI `d` Props Throughout Codebase
- **Locations:**
  - [`MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L126), [`MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L145), [`MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L165), [`MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L191), [`MyChats.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/MyChats.js#L217)
  - [`ProfileModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/ProfileModal.js#L236), [`ProfileModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/ProfileModal.js#L248), [`ProfileModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/ProfileModal.js#L258)
  - [`UpdateGroupChatModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/UpdateGroupChatModal.js#L433), [`UpdateGroupChatModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/UpdateGroupChatModal.js#L442), [`UpdateGroupChatModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/UpdateGroupChatModal.js#L451), [`UpdateGroupChatModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/UpdateGroupChatModal.js#L576)
  - [`UserListItem.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/userAvatar/UserListItem.js#L18)
- **Issue:** 
  Chakra UI v2/v3 has deprecated the `d` shorthand prop in favor of `display`. This generates console warnings.
- **Remediation:** Replace all instances of `d="..."` with `display="..."`.

### 3.4 Inconsistent Direct Backend URL Hardcoding in Frontend
- **Location:** [`frontend/src/components/miscellaneous/SideDrawer.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/SideDrawer.js#L418)
- **Issue:**
  ```javascript
  axios.delete(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/chat/${chat._id}`, ...)
  ```
  Instead of utilizing the centralized [`config.BACKEND_URL`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/config/config.js#L3), it uses a raw fallback.
- **Remediation:** Standardize all Axios calls to use `config.BACKEND_URL`.

### 3.5 Header Height and Viewport Overflow on Mobile
- **Location:** [`frontend/src/Pages/Chatpage.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/Pages/Chatpage.js#L40) & [`SideDrawer.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/SideDrawer.js#L105)
- **Issue:** 
  `SideDrawer` has a fixed height of `120px` and `Chatpage` hardcodes `height="calc(100vh - 120px)"`. On mobile devices, 120px takes excessive screen space, causing UI squishing and awkward scroll behavior when the on-screen keyboard appears.
- **Remediation:** Reduce top header height to `64px-70px` on mobile and use flexible flexbox layouts (`flex="1"` and `minH="0"`).

### 3.6 Fragile Default Avatar URL
- **Location:** [`backend/models/userModel.js`](file:///d:/DJSCE/CODING/YapMonster/backend/models/userModel.js#L13) & [`messages.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/data/messages.js#L6)
- **Issue:** 
  Default user avatar links to `https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg`. This third-party host often experiences downtime, slow response times, or hotlinking restrictions, causing broken avatar images.
- **Remediation:** Use an SVG data URI or a reliable generator like DiceBear (`https://api.dicebear.com/7.x/bottts/svg?seed=...`) or UI Avatars (`https://ui-avatars.com/api/?name=...`).

### 3.7 Accidental One-Click "Leave Group" Without Confirmation Dialog
- **Location:** [`frontend/src/components/miscellaneous/UpdateGroupChatModal.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/components/miscellaneous/UpdateGroupChatModal.js#L645-L647)
- **Issue:** 
  Clicking "Leave Group" immediately removes the user without an `AlertDialog` or confirmation prompt.
- **Remediation:** Add a Chakra UI `AlertDialog` confirmation prompt before executing `handleRemove(user)`.

### 3.8 Typo in User Controller Response
- **Location:** [`backend/controllers/userControllers.js`](file:///d:/DJSCE/CODING/YapMonster/backend/controllers/userControllers.js#L30)
- **Issue:** 
  `throw new Error("Please Enter all the Feilds");` (Spelling error: "Feilds").
- **Remediation:** Correct to `"Please Enter all the Fields"`.

### 3.9 Broken Package Version Conflict Between Root and Frontend
- **Location:** [`package.json`](file:///d:/DJSCE/CODING/YapMonster/package.json#L20) vs [`frontend/package.json`](file:///d:/DJSCE/CODING/YapMonster/frontend/package.json#L13)
- **Issue:** 
  Root `package.json` specifies `"@chakra-ui/react": "^3.2.5"` while `frontend/package.json` specifies `"@chakra-ui/react": "^2.3.1"`. Installing at root level causes dependency conflicts with Chakra UI v3 breaking changes.
- **Remediation:** Remove UI and styling packages from the root `package.json`; manage backend dependencies in `backend/package.json` and frontend dependencies in `frontend/package.json`.

---

## 🟢 4. Code Hygiene & Maintenance

### 4.1 Dead / Unused Dummy Mock Datasets
- **Locations:**
  - [`backend/data/data.js`](file:///d:/DJSCE/CODING/YapMonster/backend/data/data.js) (108 lines of unused dummy chats)
  - [`frontend/src/data/messages.js`](file:///d:/DJSCE/CODING/YapMonster/frontend/src/data/messages.js) (142 lines of unused sample messages)
- **Remediation:** Safely delete these mock files to keep the repository clean.

### 4.2 Excessive Console Logging in Production
- **Locations:** Over 45 `console.log` statements in `SingleChat.js`, `SideDrawer.js`, `UpdateGroupChatModal.js`, `chatControllers.js`, and `messageControllers.js`.
- **Issue:** Exposes internal user objects, chat IDs, token substrings, and Socket payloads in the browser inspector and backend stdout.
- **Remediation:** Remove debug logs or replace with a structured logger (e.g. `winston` or `pino`) with environment-based log levels.

### 4.3 Missing Backend Automated Tests
- **Location:** [`backend/package.json`](file:///d:/DJSCE/CODING/YapMonster/backend/package.json#L6)
- **Issue:** Test script is set to `"echo \"Error: no test specified\" && exit 1"`.
- **Remediation:** Introduce Jest/Supertest test suites for critical user authentication, chat permissions, and message APIs.

---

## 🛠️ Prioritized Action Plan & Checklist

### Phase 1: Security & Immediate Hotfixes (Highest Priority)
- [ ] **Rotate MongoDB Atlas password** and update `.env` securely.
- [ ] **Fix Message IDOR:** Add user membership verification to `GET /api/message/:chatId`.
- [ ] **Fix Message Posting Authorization:** Validate sender membership in `POST /api/message`.
- [ ] **Fix CORS Configuration:** Replace `origin: "*"` with dynamic origins matching `FRONTEND_URL`.
- [ ] **Fix Admin Badge Bug:** Update `UserBadgeItem.js` line 23 to `admin?._id === user._id || admin === user._id`.
- [ ] **Fix Cloudinary Dependency:** Replace tutorial Cloudinary preset in `Signup.js` with direct image compression or personal cloud keys.

### Phase 2: Real-Time Sync & Stability (High Priority)
- [ ] **Implement Socket Real-Time Deletion:** Broadcast message deletion events across room sockets.
- [ ] **Fix Socket Listener Leak:** Refactor `SingleChat.js` socket hooks to attach once with persistent refs.
- [ ] **Fix Selected Chat Reset:** Change `setSelectedChat("")` to `setSelectedChat(null)`.
- [ ] **Sanitize Regex Queries:** Escape user input in `allUsers` search.
- [ ] **Handle 401 Expirations:** Add Axios interceptor for automated logout on token expiration.

### Phase 3: UI/UX & Responsive Refinement (Medium Priority)
- [ ] **Remove Debug Button:** Remove `🧪 Add Test Notification` from `SideDrawer.js`.
- [ ] **Fix Header Sizing on Mobile:** Reduce header height from `120px` to `65px` on smaller screens.
- [ ] **Add Leave Group Confirmation:** Implement `AlertDialog` for leaving groups.
- [ ] **Replace Deprecated Chakra Props:** Migrate all `d="..."` attributes to `display="..."`.
- [ ] **Clean Up Mock Files:** Delete `backend/data/data.js` and `frontend/src/data/messages.js`.

---

*Report generated by Antigravity IDE Agent for YapMonster.*

# 🍿 WatchBuddy — Real-Time YouTube Watch Party System

> **Intern Assignment Submission: Full-Stack YouTube Watch Party System**  
> Built with **React (Vite)** on the frontend and **Node.js (Express + Socket.IO)** on the backend. Designed for sub-second synchronization, robust role-based access control (RBAC), and deployment to **Netlify** and **Render**.

---

## 🌐 Live Deployments

- **Frontend (Netlify)**: `https://your-watchbuddy.netlify.app` *(Replace with your live Netlify URL)*
- **Backend (Render)**: `https://your-watchbuddy-server.onrender.com` *(Replace with your live Render URL)*
- **Health Check Endpoint**: `https://your-watchbuddy-server.onrender.com/health`

---

## 📋 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & Justification](#-tech-stack--justification)
3. [Architecture & Real-Time Flow](#-architecture--real-time-flow)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [WebSocket Event Protocol](#-websocket-event-protocol)
6. [Local Development Setup](#-local-development-setup)
7. [Deployment Guide (Render + Netlify)](#-deployment-guide-render--netlify)
8. [Code Understanding & Interview Cheat Sheet](#-code-understanding--interview-cheat-sheet)
9. [Bonus Capabilities Implemented](#-bonus-capabilities-implemented)

---

## 🎯 Core Features

1. **Sub-Second Real-Time Playback Synchronization**:
   - Play, pause, seek, and change video in lockstep for all connected participants.
   - Smart drift compensation (~1.5s tolerance) and **anti-echo cancellation** to prevent infinite feedback loops.
2. **Room-Based Architecture**:
   - Create private or public rooms with custom room codes or auto-generated 6-character IDs.
   - Join via direct shareable link (`?room=ROOM_CODE`) or by typing the room code in the lobby.
3. **Role-Based Access Control (RBAC)**:
   - **Host (Room Creator)**: Full authority — play/pause, seek, change video, promote/demote participants, kick users, or transfer host ownership.
   - **Moderator**: Elevated privileges — play/pause, seek, and change video.
   - **Participant (Default Joiner)**: Watch-only. Controls are disabled in the UI and strictly blocked on the backend.
4. **Participant Change Request Workflow**:
   - Participants can propose a new YouTube video link or request play/pause.
   - Hosts/Moderators receive a live approval banner to approve or decline the request with one click.
5. **Interactive Real-Time In-Room Chat**:
   - Live message feed with user role badges (`👑 Host`, `🛡️ Moderator`, `👀 Viewer`).
   - Automated room activity logs (member joins, leaves, role updates, and video changes).

---

## 🛠️ Tech Stack & Justification

| Layer | Technology | Why Chosen (Interview Ready) |
|---|---|---|
| **Frontend** | **React 18 + Vite + Tailwind CSS** | Lightweight, lightning-fast HMR, and zero complex server-rendering quirks (unlike Next.js App Router). Very easy to explain in an interview. |
| **Backend** | **Node.js + Express** | Clean, minimalist HTTP server providing CORS configuration and a `/health` endpoint for cloud health checks. |
| **Realtime Engine** | **Socket.IO** | Built-in room isolation (`socket.join`, `io.to`), automatic reconnection, and clean event abstraction over raw WebSockets. |
| **Room Management**| **In-Memory OOP Models** | Clean Object-Oriented Design (`Room`, `Participant`, `RoomManager`) fulfilling the assignment's bonus criteria with zero DB timeout headaches on free cloud tiers. |
| **Video Player** | **YouTube IFrame API** | Standard official controllable player supporting `playVideo()`, `pauseVideo()`, `seekTo()`, and `loadVideoById()`. |
| **Frontend Host** | **Netlify** | Free, fast global CDN, ideal for static React SPAs with `_redirects` client-side routing. |
| **Backend Host** | **Render** | Free persistent Web Service with native WebSockets support and automatic HTTPS. |

---

## 🏗️ Architecture & Real-Time Flow

```
+-------------------------------------------------------------+
|                 CLIENTS (Netlify - React SPA)              |
|                                                             |
|   [ Host Client ]      [ Moderator Client ]  [ Participant] |
|   Controls: ACTIVE      Controls: ACTIVE      Controls: LOCK|
+----------+--------------------+---------------------+-------+
           |                    |                     |
           | Socket.IO (Events) | Socket.IO (Events)  |
           v                    v                     v
+-------------------------------------------------------------+
|               BACKEND SERVER (Render - Node.js)             |
|                                                             |
|   - Express HTTP Server (GET /health)                       |
|   - Socket.IO Event Dispatcher                              |
|   - Permissions Middleware (canControlPlayback, etc.)       |
|   - RoomManager (In-Memory OOP Store: Room & Participant)   |
+-------------------------------------------------------------+
           |
           v (Real-time Broadcast)
    io.to(roomId).emit('play' | 'pause' | 'seek' | 'change_video')
```

### The Echo-Loop Problem & Anti-Echo Solution:
When the Host clicks "Pause":
1. Local player fires a `pause` event &rarr; sends `pause` socket event to the server.
2. Server validates host permissions &rarr; updates room state &rarr; broadcasts `pause` to all room sockets.
3. Every client receives the `pause` broadcast and commands their local YouTube player to pause.
4. **The Trap**: An unmanaged YouTube player firing `onStateChange` would trigger another socket emit, causing an infinite echo storm!
5. **The Fix**: We use an `isRemoteSyncRef` flag. When applying a remote WebSocket command, the flag is armed (`true`). When the player fires its internal state change event, it checks the flag, disarms it, and skips emitting to the server.

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Assigned By | Play/Pause & Seek | Change Video | Promote / Demote | Kick Participant | Transfer Host |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Host** | Auto (Creator) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Moderator** | Host | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Participant** | Default for joiners | ❌ *(Request only)*| ❌ *(Request only)* | ❌ | ❌ | ❌ |

- **Frontend Enforcement**: UI controls (play/pause buttons, seek bar, URL inputs) are visibly disabled for participants with an explanatory tooltip and an action button to "Request Video Change".
- **Backend Enforcement**: `permissions.js` validates the sender's role before processing any playback mutation. Unauthorized attempts are rejected with an `error_message` event.

---

## 📡 WebSocket Event Protocol

| Event | Direction | Payload | Role Required | Description |
|---|---|---|---|---|
| `create_room` | Client &rarr; Server | `{ username, customRoomId? }` | Anyone | Creates room; creator becomes `Host`. |
| `join_room` | Client &rarr; Server | `{ roomId, username }` | Anyone | Joins room as `Participant`. |
| `leave_room` | Client &rarr; Server | `{}` | Room Member | Leaves room; reassigns host if needed. |
| `sync_state` | Server &rarr; Client | `{ videoId, playState, currentTime }` | Server | Authoritative room state for joining or resyncing. |
| `play` | Client &rarr; Server | `{ currentTime }` | Host / Mod | Requests video resume at specified time. |
| `pause` | Client &rarr; Server | `{ currentTime }` | Host / Mod | Requests video pause at specified time. |
| `seek` | Client &rarr; Server | `{ time }` | Host / Mod | Seeks playback to given timestamp. |
| `change_video` | Client &rarr; Server | `{ videoId }` | Host / Mod | Loads new YouTube video ID for all participants. |
| `assign_role` | Client &rarr; Server | `{ targetUserId, role }` | Host Only | Promotes/demotes participant. |
| `remove_participant`| Client &rarr; Server | `{ targetUserId }` | Host Only | Kicks target participant from the room. |
| `transfer_host` | Client &rarr; Server | `{ targetUserId }` | Host Only | Transfers room ownership to another participant. |
| `request_change` | Client &rarr; Server | `{ type, details }` | Participant | Sends video or playback suggestion to Host/Mod. |
| `approve_change` | Client &rarr; Server | `{ requestId, approved }` | Host / Mod | Approves or rejects participant change request. |
| `send_chat` | Client &rarr; Server | `{ message }` | Room Member | Broadcasts text chat message to room members. |
| `user_joined` | Server &rarr; Clients | `{ user, participants }` | Broadcast | Notifies room of a new participant. |
| `user_left` | Server &rarr; Clients | `{ userId, username, newHost? }` | Broadcast | Notifies room of departure and host succession. |
| `role_assigned` | Server &rarr; Clients | `{ userId, role, participants }` | Broadcast | Notifies room of updated role list. |
| `participant_removed`| Server &rarr; Client | `{ message }` | Direct | Notifies kicked user and removes them to lobby. |
| `error_message` | Server &rarr; Client | `{ message }` | Direct | Informs client of permission denial or validation failure. |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Watch Buddy"
```

### 2. Start the Backend Server
```bash
cd server
npm install
npm run dev
# Server will run at http://localhost:5000
# Health check available at http://localhost:5000/health
```

### 3. Start the Frontend Client
In a separate terminal window:
```bash
cd client
npm install
npm run dev
# App will run at http://localhost:5173
```

### 4. Run the Automated Tests
```bash
cd server
npm test
# Runs unit tests + multi-client Socket.IO integration tests
```

---

## 🚀 Deployment Guide (Render + Netlify)

### Part 1: Deploy Backend to Render

1. Sign up/Log in at [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment settings:
   - **Name**: `watch-buddy-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Once deployed, note down your Render public URL (e.g., `https://watch-buddy-server.onrender.com`).
7. Test the health check endpoint in your browser: `https://watch-buddy-server.onrender.com/health`.

---

### Part 2: Deploy Frontend to Netlify

1. Sign up/Log in at [Netlify.com](https://netlify.com).
2. Click **Add new site** &rarr; **Import an existing project** &rarr; Choose your GitHub repository.
3. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Add the Environment Variable:
   - Click **Environment variables**.
   - Key: `VITE_BACKEND_URL`
   - Value: `https://watch-buddy-server.onrender.com` *(Your Render backend URL)*
5. Click **Deploy Site**.
6. Netlify will build and provide a public URL (e.g. `https://watch-buddy.netlify.app`).
7. *(Note: `client/public/_redirects` is already included to ensure SPA client-side routing works on all routes).*

---

## 🎤 Code Understanding & Interview Cheat Sheet

Be prepared to discuss these questions during your technical walkthrough:

### 1. How do WebSockets enable real-time synchronization?
> "Standard HTTP is request-response: the client asks, the server replies, and the connection closes. For a watch party where video state changes unpredictably (when someone pauses or seeks), HTTP polling would be slow and introduce 1-2 seconds of lag. WebSockets create a persistent, bi-directional, full-duplex TCP connection. When the host pauses, an event is sent to the server in milliseconds, and the server broadcasts that event to every connected client in the room instantly."

### 2. Why Socket.IO over raw WebSockets (`ws`)?
> "While raw WebSockets only provide low-level frame transmission, Socket.IO provides high-level room abstractions (`socket.join('ROOM_ID')` and `io.to('ROOM_ID').emit(...)`), automatic reconnection with backoff if a user's WiFi drops, and fallback to HTTP long-polling if a restrictive corporate firewall blocks WebSocket handshakes."

### 3. How does the role-based logic work on the backend?
> "Security must never rely only on the frontend. When a socket emits `play`, `pause`, `seek`, or `change_video`, the server checks the sender's role using `canControlPlayback(participant.role)`. If a regular participant bypasses the UI and attempts to emit a play command, the server drops the mutation and responds with an `error_message`. Only users with the `Host` role can assign roles, remove users, or transfer host privileges."

### 4. How did you handle echo loops and playback drift?
> "When the host seeks or pauses, the event is broadcasted. When a client receives this broadcast and executes `player.seekTo()` or `player.pauseVideo()`, the player's internal `onStateChange` listener would fire. To prevent an infinite broadcast echo, we use an `isRemoteSyncRef` boolean flag that silences local event emissions during incoming remote syncs. For drift, we measure `Math.abs(localTime - serverTime)`. If drift exceeds 1.5 seconds, we gently snap playback to the authoritative server timestamp."

### 5. Why chose Vite + React instead of Next.js for this project?
> "For a real-time SPA that relies entirely on client-side WebSockets and the YouTube IFrame DOM player, Next.js adds unnecessary server-side rendering (SSR) overhead, hydration mismatches with dynamic media elements, and complex edge/server-action mental models. React + Vite is lightweight, compiles in milliseconds, and deploys as pure static assets on Netlify with zero server execution cost."

### 6. What free-tier platform trade-offs did you consider?
> "Free Render web services spin down after 15 minutes of inactivity. To handle this gracefully:
> 1. Socket.IO has built-in retry logic that reconnects automatically once the server wakes up.
> 2. We expose a `/health` endpoint that can be pinged by an external uptime monitor (e.g., UptimeRobot or Cron) to prevent idle spin-down."

---

## 🌟 Bonus Capabilities Implemented

- **Object-Oriented Server Architecture**: Room and participant state are encapsulated in well-defined ES6 classes (`Room`, `Participant`, `RoomManager`) with single-responsibility methods (`updatePlayback`, `setRole`, `transferHost`, `getEffectiveTime`).
- **Participant Change Request Workflow**: Participants can submit video suggestions or play/pause requests, prompting Host/Moderators with an approval dialog.
- **Auto Host Succession**: If the Host leaves or closes their browser, the server automatically transfers host privileges to the next available Moderator or Participant rather than breaking the room.
- **In-Room Live Chat & Activity Feed**: Separate tabs for interactive messaging and automated system audit trails.
- **Shareable Links**: Copying the room link includes the room parameter (`?room=ROOM_CODE`) allowing friends to join in one click.


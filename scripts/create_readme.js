const { write } = require('./writer.js');

write('README.md', `
# 🎬 VSHARE — High-Performance Video Streaming Platform

**VSHARE** is a modern full-stack web application for media streaming, video sharing, and community engagement built on **React 19**, **Tailwind CSS**, **Node.js/Express**, **FFmpeg HLS Transcoder Engine**, and **MongoDB**.

---

## 🌟 Key Features

- **⚡ Custom HLS Web Player**:
  - Buffer-free adaptive streaming via \`hls.js\`
  - Speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
  - Multi-resolution stream quality switcher (Auto, 720p, 480p, 360p)
  - Keyboard shortcuts (Space: Play/Pause, F: Fullscreen, M: Mute)
- **🎥 Chunked Upload & Transcoding Pipeline**:
  - Supports raw video uploads (\`.mp4\`, \`.mkv\`, \`.avi\`, \`.mov\`)
  - Automated background segmentation into \`.m3u8\` playlists and \`.ts\` slices
  - Auto poster frame generation from video at 1s timestamp
- **🔐 Secure Authentication & JWT Sessions**:
  - Encrypted bcrypt password hashing
  - Stateless Bearer JWT tokens
- **👥 Engagement Engine**:
  - Nested micro-comment layer with delete controls
  - Real-time like & dislike counters
  - Channel subscriptions with subscriber counts
  - Personalized persistent watchlist
- **🎨 Modern UI/UX**:
  - Dark mode aesthetic tailored for media consumption
  - Responsive creator studio channel dashboards

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Hls.js, Axios, React Router 7 |
| **Backend** | Node.js (v22), Express.js, Fluent-FFmpeg, @ffmpeg-installer/ffmpeg, Multer, JWT, Bcrypt |
| **Database** | MongoDB & Mongoose |

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 5000)
\`\`\`bash
cd server
npm install
node seed.js    # Populates initial demo creators, channels, and videos
npm start       # or 'npm run dev'
\`\`\`

### 2. Start the Frontend Client (Port 5173)
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`
Visit **\`http://localhost:5173\`** in your browser.

---

## 👤 Demo Login Credentials
- **Lead Systems Engineer:** \`bharat@vshare.io\` / \`password123\`
- **Internal Guide:** \`siddhi@vshare.io\` / \`password123\`
- **Creator Channel:** \`alex@vshare.io\` / \`password123\`
`);

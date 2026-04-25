# 🗳️ Sovereign Ledger — Decentralised Voting System

A full-stack blockchain-based voting platform built on **Polygon Amoy** with an **Express.js** backend, **MongoDB Atlas** database, and **Cloudinary** image storage. Designed to be transparent, tamper-proof, and deployable at zero cost.

🌐 **Live Demo:** https://decentralised-voting-system-eta.vercel.app
⚙️ **Backend API:** https://voting-system-backend-9xsy.onrender.com

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Smart Contract](#-smart-contract)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Voter Features
- 🪪 **Aadhar-based identity** — 12-digit Aadhar number as unique voter ID
- 🔞 **Age verification** — under-18 registration automatically rejected
- 🗳️ **Blockchain voting** — every vote recorded immutably on Polygon Amoy
- 🧾 **Voting receipt** — transaction hash + candidate name shown after voting, persisted across sessions
- 🚫 **Double-vote prevention** — enforced at both MongoDB and smart contract level

### Candidate Features
- 📸 **Photo upload** — candidate photo required at registration (stored on Cloudinary, auto face-cropped)
- ✅ **Admin approval workflow** — candidates are pending until admin approves
- 🏛️ **Party affiliation** — party name stored and displayed on ballot
- 🔘 **NOTA option** — None of the Above always available

### Admin Features
- 🔐 **Separate admin login** — JWT-protected admin session
- 📅 **Election management** — create elections with title, description, dates, status
- 👥 **Candidate approval panel** — approve or reject candidates per election
- 📊 **Election results** — view vote counts per candidate

### Security Features
- 🛡️ **NoSQL injection protection** — express-mongo-sanitize strips $ and . operators globally
- ✍️ **Field-level validation** — name, email, Aadhar, ObjectId all sanitized before DB queries
- 🔑 **JWT admin auth** — admin endpoints protected with signed tokens
- 🌐 **CORS whitelist** — only the Vercel frontend domain can call the backend
- 📁 **No sensitive data in frontend** — private keys and secrets never leave the backend

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 / CSS3 / Vanilla JS | Core UI — no framework, zero build step |
| Vercel | Hosting + auto-deploy on every git push |
| Fetch API + FormData | REST calls + multipart photo upload |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18.x | Runtime |
| Express.js v5 | REST API framework |
| Mongoose v9 | MongoDB ODM |
| Multer + multer-storage-cloudinary | Candidate photo upload |
| Cloudinary | Cloud image storage (auto face-crop) |
| express-mongo-sanitize | NoSQL injection protection |
| validator.js | Email, string, Aadhar validation |
| JSON Web Tokens | Admin authentication |
| Render | Backend hosting + auto-deploy |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud NoSQL database |
| Mongoose Schemas | Voter, Candidate, Election, Vote models |

### Blockchain
| Technology | Purpose |
|---|---|
| Solidity ^0.8.20 | Smart contract |
| Hardhat | Compile + deploy toolchain |
| Ethers.js v6 | Backend to blockchain communication |
| Polygon Amoy Testnet | Fast, free-gas blockchain network |
| Alchemy / Infura | RPC provider |

---

## 📁 Project Structure

```
decentralised-voting-system/
├── blockchain/
│   ├── contracts/
│   │   └── Voting.sol              # Smart contract (tracks votes by voterId string)
│   ├── scripts/
│   │   └── deploy.js               # Hardhat deploy script
│   ├── hardhat.config.ts
│   └── .env.example
│
├── backend/
│   ├── abi/
│   │   └── Voting.json             # ABI used by backend to call contract
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── blockchain.js           # Ethers.js contract setup
│   ├── controllers/
│   │   ├── voterController.js      # Register voter, lookup by Aadhar
│   │   ├── candidateController.js  # Register candidate, approval
│   │   ├── electionController.js   # Create/list elections
│   │   ├── voteController.js       # Cast vote (DB + blockchain)
│   │   └── adminController.js      # Admin login/session
│   ├── middleware/
│   │   ├── requireAdmin.js         # JWT admin auth middleware
│   │   └── upload.js               # Cloudinary multer storage
│   ├── models/
│   │   ├── Voter.js                # votedElections includes txHash + candidateName
│   │   ├── Candidate.js            # photoUrl, approvalStatus, blockchainId
│   │   ├── Election.js             # title, dates, status
│   │   └── Vote.js                 # voterId, candidateId, txHash
│   ├── routes/
│   │   ├── voterRoutes.js
│   │   ├── candidateRoutes.js      # POST uses multer upload middleware
│   │   ├── electionRoutes.js       # POST requires admin
│   │   ├── voteRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── sanitize.js             # sanitizeName, sanitizeEmail, sanitizeAadhar etc.
│   │   ├── adminAuth.js            # JWT sign/verify
│   │   ├── blockchainCandidate.js  # registerCandidateOnBlockchain()
│   │   ├── electionStatus.js       # upcoming / active / completed
│   │   └── voteScope.js            # buildScopedVoterKey()
│   ├── server.js                   # Express app, CORS, mongo-sanitize middleware
│   └── package.json
│
├── frontend/
│   ├── index.html                  # Single page app
│   ├── script.js                   # All client logic
│   └── styles.css                  # Responsive design (mobile + desktop)
│
├── render.yaml                     # Render deployment config
├── vercel.json                     # Vercel routing config
└── README.md
```

---

## 📋 Prerequisites

- Node.js 18.x+
- npm 9.x+
- Git
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Render account (free)
- Vercel account (free)
- Alchemy or Infura account for Polygon Amoy RPC (free)
- A crypto wallet with test MATIC from https://faucet.polygon.technology/

---

## 💻 Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/trynafind-sumanyu/decentralised-voting-system.git
cd decentralised-voting-system
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install blockchain dependencies
```bash
cd ../blockchain
npm install
```

### 4. Configure environment variables (see below)

### 5. Start the backend
```bash
cd backend
npm run dev
# Server running on port 5000
# MongoDB connected successfully
```

### 6. Open the frontend
```bash
open frontend/index.html
```

---

## ⚙️ Environment Variables

### backend/.env
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/voting

# Admin credentials (you choose these)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongPassword123
ADMIN_TOKEN_SECRET=some-long-random-secret-string

# Blockchain
PRIVATE_KEY=0xyour_wallet_private_key
NETWORK=amoy
RPC_URL_AMOY=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
RPC_URL_LOCAL=http://127.0.0.1:8545
AMOY_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - set to your Vercel URL in production
ALLOWED_ORIGIN=https://your-app.vercel.app
```

### blockchain/.env
```env
PRIVATE_KEY=your_wallet_private_key
RPC_URL_AMOY=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
```

---

## 🚀 Deployment

### Step 1 — Deploy Smart Contract
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network amoy
# Contract deployed to: 0xABC123...  <- copy this address
```

### Step 2 — Deploy Backend to Render
1. Go to render.com → New Web Service → connect GitHub repo
2. Set Root Directory to `backend`
3. Set Build Command to `npm install`
4. Set Start Command to `npm start`
5. Add all env vars from backend/.env above
6. Click Deploy

### Step 3 — Deploy Frontend to Vercel
1. Go to vercel.com → New Project → import GitHub repo
2. Set Root Directory to `frontend`
3. Leave build command blank (static site)
4. Click Deploy

### Step 4 — Update CORS
In Render → Environment → set:
```
ALLOWED_ORIGIN=https://your-app.vercel.app
```
Then redeploy backend.

---

## 📚 API Reference

**Base URL:** `https://voting-system-backend-9xsy.onrender.com/api`

### Voters
| Method | Endpoint | Description |
|---|---|---|
| POST | /voters | Register a new voter |
| GET | /voters/lookup?aadharNumber= | Sign in / look up voter |

### Elections
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /elections | — | List all elections |
| POST | /elections | Admin | Create election |
| GET | /elections/:id/results | — | Get vote results |

### Candidates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /candidates?electionId= | — | List approved candidates |
| POST | /candidates | — | Register candidate (with photo) |
| GET | /candidates/admin?electionId= | Admin | List all candidates |
| PATCH | /candidates/:id/approval | Admin | Approve or reject candidate |

### Votes
| Method | Endpoint | Description |
|---|---|---|
| POST | /votes | Cast a vote |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | /admin/login | Admin login → returns JWT |
| GET | /admin/session | Verify admin session |

---

## ⛓️ Smart Contract

**File:** `blockchain/contracts/Voting.sol`

```solidity
function addCandidate(string memory _name) public
function vote(string memory _voterId, uint _candidateId) public
function getAllCandidates() public view returns (Candidate[] memory)
```

Votes are tracked by `_voterId` (a scoped string combining MongoDB voter + election IDs) instead of `msg.sender` — this allows multiple voters to use the same backend wallet without triggering the already-voted check.

**Network:** Polygon Amoy Testnet
**Explorer:** https://amoy.polygonscan.com/

---

## 🔐 Security

| Layer | Protection |
|---|---|
| Global | express-mongo-sanitize strips $ and . from all requests |
| Voter registration | Name (unicode letters only), Email (format + normalize), Aadhar (12 digits), DOB (future date rejected, age < 18 rejected) |
| Candidate registration | Name + party sanitized; ObjectId validated; photo type + size enforced |
| Election creation | Title + description HTML-escaped and length-capped |
| Admin routes | JWT Bearer token required |
| CORS | Only ALLOWED_ORIGIN can call the API |
| Images | Stored on Cloudinary — Render ephemeral disk never used |

---

## 🔍 Troubleshooting

| Problem | Fix |
|---|---|
| MODULE_NOT_FOUND: ../utils/sanitize | Push backend/utils/sanitize.js to GitHub |
| MODULE_NOT_FOUND: ../middleware/upload | Push backend/middleware/upload.js to GitHub |
| argument handler must be a function | Wrong file committed as voterController.js — re-push correct file |
| MongoDB connection failed | Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access |
| Ballot shows empty | No elections created — log in as admin and create one |
| Candidates not on ballot | Admin has not approved them — Admin panel → select election → approve |
| Failed to fetch on admin actions | CORS missing PATCH method — check server.js CORS config |
| Render cold start (slow) | Free tier sleeps after 15 min — use UptimeRobot to ping every 5 min |
| Vote receipt shows -- after re-login | Push latest voteController.js which saves candidateName to MongoDB |
| Git push rejected | Run: git fetch origin && git reset --hard origin/main then re-add files |

---

## 🆚 Competitive Advantages

| Feature | This Project | Voatz | Polys | Open Source |
|---|---|---|---|---|
| Blockchain votes | ✅ | ✅ | ❌ | Rarely |
| Candidate photo | ✅ | ❌ | ❌ | ❌ |
| Admin approval flow | ✅ | ✅ | ✅ | ❌ |
| NOTA option | ✅ | ❌ | ❌ | ❌ |
| Input sanitization | ✅ | Unknown | Unknown | ❌ |
| Free to deploy | ✅ | ❌ | ❌ | ✅ |
| Aadhar identity | ✅ | ❌ | ❌ | ❌ |
| Receipt after re-login | ✅ | ✅ | ✅ | ❌ |

---

## 📝 Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | Apr 2026 | Initial release — voter/candidate registration, blockchain voting |
| 1.1.0 | Apr 2026 | Admin portal — election creation, candidate approval workflow |
| 1.2.0 | Apr 2026 | Candidate photo upload via Cloudinary |
| 1.3.0 | Apr 2026 | NoSQL injection protection, input sanitization across all endpoints |
| 1.4.0 | Apr 2026 | Voting receipt persists candidateName across sessions |
| 1.5.0 | Apr 2026 | Mobile responsive layout, retry buttons, background ballot preload |

---

**Made with ❤️ for transparent, secure, and accessible democratic voting.**
# 🗳️ Decentralized Voting System

A blockchain-based voting system built on Polygon that enables secure, transparent, and immutable voter registration and voting through smart contracts.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- ✅ **Secure Voter Registration** - Age verification, Aadhar number validation, email verification
- ✅ **Blockchain Voting** - Immutable vote recording on Polygon blockchain
- ✅ **Election Management** - Create and manage multiple elections
- ✅ **Candidate Registration** - Register candidates for specific elections
- ✅ **Vote Verification** - Transaction receipts with blockchain confirmation
- ✅ **Duplicate Prevention** - Aadhar and email uniqueness constraints

### Technical Features
- 🔒 MongoDB Atlas cloud database
- ⛓️ Polygon (Amoy testnet) blockchain integration
- 🌐 CORS-enabled REST API
- 🎨 Responsive web frontend
- 📱 Real-time voter feedback
- 🔍 Transaction tracking with Polygonscan

---

## 🛠️ Tech Stack

### Blockchain
- **Smart Contract**: Solidity 0.8.20
- **Network**: Polygon Amoy (testnet)
- **Framework**: Hardhat
- **Web3 Library**: ethers.js v6

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB 9.4 (Atlas)
- **Language**: JavaScript (CommonJS)

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (custom variables, responsive design)
- **JavaScript (ES6+)** - Client-side logic
- **Fetch API** - HTTP requests

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **Deployment**: Render (backend), GitHub Pages/Netlify (frontend)
- **Database Hosting**: MongoDB Atlas

---

## 📁 Project Structure

```
decentralised-voting-system/
├── blockchain/                          # Smart contract & deployment
│   ├── contracts/
│   │   └── Voting.sol                   # Main voting smart contract
│   ├── scripts/
│   │   └── deploy.js                    # Deployment script
│   ├── hardhat.config.ts                # Hardhat configuration
│   ├── package.json
│   └── .env.example                     # Environment template
│
├── backend/                             # API server
│   ├── config/
│   │   ├── db.js                        # MongoDB connection
│   │   └── blockchain.js                # Smart contract interaction
│   ├── controllers/                     # Request handlers
│   │   ├── voterController.js
│   │   ├── electionController.js
│   │   ├── candidateController.js
│   │   └── voteController.js
│   ├── models/                          # MongoDB schemas
│   │   ├── Voter.js
│   │   ├── Election.js
│   │   ├── Candidate.js
│   │   └── Vote.js
│   ├── routes/                          # API routes
│   │   ├── voterRoutes.js
│   │   ├── electionRoutes.js
│   │   ├── candidateRoutes.js
│   │   └── voteRoutes.js
│   ├── server.js                        # Express app entry point
│   ├── package.json
│   └── .env.example                     # Environment template
│
├── frontend/                            # Web interface
│   ├── index.html                       # Main page
│   ├── script.js                        # Client-side logic
│   ├── styles.css                       # Styling
│   └── .env.example                     # Environment template
│
├── DEPLOYMENT_GUIDE.md                  # Deployment instructions
├── DEPLOYMENT_STEPS.md                  # Detailed step-by-step
├── DEPLOYMENT_CHECKLIST.md              # Progress tracker
├── QUICK_REFERENCE.md                   # Quick commands
├── GITHUB_SECURITY_CHECKLIST.md         # Security steps
├── GITHUB_SAFETY_REPORT.md              # Security analysis
├── .gitignore                           # Git ignore rules
└── README.md                            # This file
```

---

## 📋 Prerequisites

### System Requirements
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** 2.x or higher

### External Accounts Required
- **MetaMask** or similar Web3 wallet
- **GitHub** account (for code hosting)
- **MongoDB Atlas** account (free tier available)
- **Render** account (for backend hosting)

### Testnet Requirements
- **Polygon Amoy testnet MATIC** (get from faucet: https://faucet.polygon.technology/)

---

## 📥 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

### 2. Setup Blockchain Development
```bash
cd blockchain
npm install
```

### 3. Setup Backend
```bash
cd ../backend
npm install
```

### 4. Setup Frontend
```bash
cd ../frontend
# Frontend is static - no installation needed
# (Optional: if using a local server)
```

---

## ⚙️ Configuration

### Blockchain Setup (.env)
Create `blockchain/.env` from template:
```bash
cd blockchain
cp .env.example .env
```

Fill in your values:
```env
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL_AMOY=https://rpc-amoy.polygon.technology
```

### Backend Setup (.env)
Create `backend/.env` from template:
```bash
cd backend
cp .env.example .env
```

Fill in your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_db
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_VOTING_CONTRACT=0x...contract_address_here...
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration
Update `frontend/script.js` line ~5:
```javascript
// For local development (already configured):
const API_BASE = "http://localhost:5000/api";

// For production (after deployment):
const API_BASE = "https://your-backend-url.onrender.com/api";
```

---

## 🚀 Running Locally

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Expected output:
```
Server running on port 5000
MongoDB connected successfully ✅
```

### 2. Open Frontend
```bash
# Option A: Open in browser directly
open frontend/index.html

# Option B: Use a local server (if available)
cd frontend
# python -m http.server 3000  (Python)
# or
# npx http-server -p 3000     (Node.js)
```

Visit: `http://localhost:3000` or wherever your frontend is served

### 3. Test the Application
1. Register a voter:
   - Navigate to "Register" → "Voter"
   - Fill form with test data
   - Aadhar: 12 digits
   - DOB: Must be 18+
   - Email: Valid email format

2. Sign in:
   - Use the Aadhar number you registered

3. Register an election (if admin endpoint available):
   - Navigate to elections
   - Fill election details

4. Cast a vote:
   - Sign in as voter
   - Select a candidate
   - Click "Cast Vote"

---

## 🚀 Deployment

### Quick Start
For step-by-step deployment instructions, see:
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Overview
- **[DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)** - Detailed steps
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Progress tracker

### High-Level Overview

1. **Smart Contract Deployment**
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network amoy
   ```
   Save the contract address!

2. **Backend Deployment (Render)**
   - Push code to GitHub
   - Create Web Service on Render
   - Set environment variables
   - Deploy

3. **Database (MongoDB Atlas)**
   - Create cluster
   - Create database user
   - Whitelist IPs
   - Get connection string

4. **Frontend Deployment**
   - Update API_BASE URL
   - Deploy on Netlify or GitHub Pages

---

## 📚 API Documentation

### Base URL
**Local:** `http://localhost:5000/api`

### Endpoints

#### Voters
```
POST   /api/voters                    # Register new voter
GET    /api/voters/lookup?aadharNumber=...   # Get voter by Aadhar
```

#### Elections
```
GET    /api/elections                 # Get all elections
POST   /api/elections                 # Create new election
GET    /api/elections/:id             # Get election details
```

#### Candidates
```
GET    /api/candidates?electionId=... # Get candidates for election
POST   /api/candidates                # Register candidate
```

#### Votes
```
POST   /api/votes                     # Cast a vote
GET    /api/votes/:id                 # Get vote details
```

### Request/Response Examples

**Register Voter:**
```bash
curl -X POST http://localhost:5000/api/voters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "aadharNumber": "123456789012",
    "dateOfBirth": "2000-01-15"
  }'
```

**Response:**
```json
{
  "message": "Voter registered successfully",
  "voter": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "aadharNumber": "123456789012",
    "age": 24,
    "hasVoted": false,
    "createdAt": "2026-04-24T10:30:00Z"
  }
}
```

---

## ⛓️ Smart Contract

### Voting.sol Functions

```solidity
// Record a vote on blockchain
recordVote(address voter, uint256 candidateId, uint256 electionId)

// Get election details
getElection(uint256 electionId)

// Get candidate details
getCandidate(uint256 candidateId)

// Check if voter has voted
hasVoted(address voter, uint256 electionId)
```

### Contract Deployment
- **Network**: Polygon Amoy
- **Explorer**: https://amoy.polygonscan.com/

---

## 🧪 Testing

### Local Testing
1. Start backend: `npm run dev` (in backend folder)
2. Open frontend in browser
3. Register test voters
4. Cast test votes
5. Verify in MongoDB Atlas and Polygonscan

### Test Data
```javascript
// Sample voter data for testing
{
  "name": "Test Voter",
  "email": "test@example.com",
  "aadharNumber": "123456789012",
  "dateOfBirth": "2000-01-15"
}

// Sample election data
{
  "title": "Presidential Election 2026",
  "description": "General elections",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31"
}
```

### Manual Testing Checklist
- [ ] Register voter with valid data
- [ ] Reject voter under 18 years old
- [ ] Reject duplicate email
- [ ] Reject duplicate Aadhar
- [ ] Register invalid Aadhar (not 12 digits)
- [ ] Sign in with correct Aadhar
- [ ] Sign in with wrong Aadhar
- [ ] Cast vote (verify blockchain transaction)
- [ ] Prevent duplicate votes
- [ ] Check MongoDB for stored data

---

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check Node version
node --version  # Should be 18.x or higher

# Check port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Check MongoDB connection
# Verify MONGO_URI in .env is correct
# Verify IP is whitelisted in MongoDB Atlas
```

### MongoDB Connection Failed
- ✅ Check connection string format
- ✅ Verify username and password
- ✅ Whitelist your IP in MongoDB Atlas
- ✅ Ensure network connectivity

### Smart Contract Deployment Fails
- ✅ Verify you have test MATIC
- ✅ Check PRIVATE_KEY format (no 0x prefix)
- ✅ Verify RPC_URL is correct
- ✅ Check gas fees

### Frontend Can't Reach Backend
- ✅ Check API_BASE URL is correct
- ✅ Verify CORS_ORIGIN in backend
- ✅ Check browser console for errors (F12)
- ✅ Use browser DevTools to inspect network requests

### Vote Not Recording
- ✅ Verify contract address matches deployed address
- ✅ Check Polygon network is Amoy
- ✅ Monitor backend logs for errors
- ✅ Check transaction on Polygonscan

---

## 🔐 Security

### Important Security Notes

⚠️ **Never commit `.env` files!**
- Use `.env.example` as template
- `.env` files are protected by `.gitignore`
- All secrets should be in environment variables only

⚠️ **Private Keys**
- Never share your private key
- Never commit private key to git
- Regenerate keys after any exposure
- Use different keys for different environments

⚠️ **Database Security**
- Use strong passwords (MongoDB)
- Whitelist specific IPs in production
- Enable two-factor authentication
- Regular backups

⚠️ **Smart Contract**
- Test thoroughly on testnet first
- Consider code audit before mainnet
- Keep contract addresses private

### Credentials to Regenerate Before Production
1. MongoDB password
2. Private wallet key
3. API keys (if using)
4. Infura/RPC keys (if using)

---

## 🤝 Contributing

### Fork & Clone
```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
git checkout -b feature/your-feature-name
```

### Make Changes
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit
git add .
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature
```

### Pull Request
1. Go to GitHub repository
2. Create Pull Request
3. Describe your changes
4. Wait for review

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📞 Support & Contact

### Getting Help
- 📖 Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
- 🔐 Check [GITHUB_SECURITY_CHECKLIST.md](GITHUB_SECURITY_CHECKLIST.md) for security setup
- ⚡ Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick commands
- 🐛 Check GitHub Issues for common problems

### Useful Resources
- **Polygon Docs**: https://wiki.polygon.technology/
- **Hardhat Docs**: https://hardhat.org/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Ethers.js Docs**: https://docs.ethers.org/
- **Express.js Docs**: https://expressjs.com/

### Faucets & Explorers
- **Amoy Faucet**: https://faucet.polygon.technology/
- **Amoy Explorer**: https://amoy.polygonscan.com/
- **MetaMask**: https://metamask.io/

---

## 🎯 Roadmap

### Current Version (v1.0)
- ✅ Voter registration with validation
- ✅ Election management
- ✅ Voting with blockchain recording
- ✅ Vote verification

### Future Features
- 🔄 Admin dashboard
- 🔄 Real-time vote counting
- 🔄 Audit logging
- 🔄 Email notifications
- 🔄 QR code voter verification
- 🔄 Multi-language support
- 🔄 Mobile app

---

## 📊 Project Stats

```
Project Type:        Blockchain Voting System
Total Files:         43
Lines of Code:       ~5000+
Backend Routes:      12 API endpoints
Smart Contract:      1 main contract (Voting.sol)
Database Schemas:    4 (Voter, Election, Candidate, Vote)
Supported Networks:  Polygon Amoy (testnet)
```

---

## 🎉 Quick Start (TL;DR)

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/voting-system.git
cd voting-system

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# 3. Start backend
npm run dev

# 4. Open frontend
open frontend/index.html

# 5. Register and vote!
```

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-24 | Initial release - Polygon Amoy testnet |

---

**Made with ❤️ for transparent, secure voting**

*Last Updated: April 24, 2026*

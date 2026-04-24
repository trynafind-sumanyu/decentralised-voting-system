# Polygon Deployment Guide

## Overview
- **Smart Contracts**: Polygon Amoy (testnet)
- **Backend**: Render (Node.js)
- **Database**: MongoDB Atlas
- **Frontend**: Static hosting (GitHub Pages or Netlify)

---

## Step 1: Setup Environment Variables

Create a `.env` file in the **blockchain** folder:

```env
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL_AMOY=https://rpc-amoy.polygon.technology
```

Create a `.env` file in the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_VOTING_CONTRACT=contract_address_after_deployment
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Important**: Never commit `.env` files to git!

---

## Step 2: Deploy Smart Contract to Polygon Amoy

### 2.1 Get Test MATIC
1. Go to: https://faucet.polygon.technology/
2. Enter your wallet address
3. Request test MATIC (wait for confirmation)

### 2.2 Deploy Contract
```bash
cd blockchain
npm install

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.js --network amoy
```

**Save the deployed contract address** - you'll need this later!

---

## Step 3: Setup MongoDB Atlas

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Create a database user with username/password
5. Add your IP to the whitelist (or allow all: 0.0.0.0/0)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/voting_db`

Update `.env` in backend with this connection string.

---

## Step 4: Prepare Backend for Deployment

### 4.1 Update blockchain.js config

Edit `backend/config/blockchain.js`:

```javascript
const CONTRACT_ADDRESS = process.env.POLYGON_VOTING_CONTRACT;
const RPC_URL = process.env.POLYGON_RPC_URL;

// Rest of your config
```

### 4.2 Update voterRoutes, voteRoutes, etc. to use env variables

### 4.3 Add to backend/package.json:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

---

## Step 5: Deploy Backend on Render

### 5.1 Push Code to GitHub

```bash
cd d:\decentralised voting system
git init
git add .
git commit -m "Initial commit for Polygon deployment"
git remote add origin https://github.com/yourusername/voting-system.git
git branch -M main
git push -u origin main
```

### 5.2 Deploy on Render

1. Go to: https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your GitHub repository
5. Configure:
   - **Name**: voting-system-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Region**: Choose closest to users
6. Add Environment Variables:
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `POLYGON_RPC_URL`: https://rpc-amoy.polygon.technology
   - `POLYGON_VOTING_CONTRACT`: your deployed contract address
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: https://yourdomain.com (update later)

7. Click "Deploy"

**Save your Render backend URL** - format: `https://voting-system-backend.onrender.com`

---

## Step 6: Update Frontend for Production

### 6.1 Edit frontend/script.js

Change:
```javascript
const API_BASE = "http://localhost:5000/api";
```

To:
```javascript
const API_BASE = "https://voting-system-backend.onrender.com/api";
```

### 6.2 Update contract configuration (if needed)

Ensure the frontend knows the correct contract address and uses Amoy RPC.

---

## Step 7: Deploy Frontend

### Option A: GitHub Pages (Free)

1. Create repo: `yourusername.github.io`
2. Push frontend folder
3. Access at: `https://yourusername.github.io`

### Option B: Netlify (Recommended)

1. Go to: https://netlify.com
2. Connect GitHub repo
3. Configure:
   - Build command: (leave empty for static site)
   - Publish directory: `frontend/`
4. Deploy

---

## Step 8: Update CORS in Backend

Once you have your frontend URL, update backend `.env`:

```env
CORS_ORIGIN=https://your-frontend-url.com
```

And update `backend/server.js`:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
```

Redeploy on Render.

---

## Step 9: Test Everything

1. ✅ Visit your frontend URL
2. ✅ Register a voter
3. ✅ Check MongoDB Atlas - data should appear
4. ✅ Sign in and cast a vote
5. ✅ Check Polygon Amoy explorer: https://amoy.polygonscan.com/ for transaction

---

## Useful Links

- Polygon Amoy Testnet Explorer: https://amoy.polygonscan.com/
- Get Test MATIC: https://faucet.polygon.technology/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render Dashboard: https://dashboard.render.com
- Etherscan Verify Contract: https://amoy.polygonscan.com/apis (for verification)

---

## Troubleshooting

### Contract deployment fails
- Ensure you have test MATIC in wallet
- Check RPC URL is correct
- Verify private key is correct format

### Backend won't deploy
- Check Node version compatibility
- Ensure all env variables are set
- Check logs in Render dashboard

### Frontend can't reach backend
- Verify CORS_ORIGIN is correct
- Check API_BASE URL in script.js
- Use browser DevTools to see network errors

### Voting not working
- Ensure contract address matches deployed address
- Check MongoDB is accessible
- Verify Polygon network in wallet is set to Amoy

---

## Next Steps (Production)

When ready for production:
1. Deploy to **Polygon Mainnet** (requires real MATIC)
2. Use **Vercel or Netlify** for frontend (better performance)
3. Enable **HTTPS everywhere**
4. Setup **domain name** (e.g., voting.example.com)
5. Add rate limiting to backend
6. Setup monitoring and logging

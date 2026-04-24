# Step-by-Step Polygon Deployment Guide

## Part 1: Smart Contract Deployment (Polygon Amoy)

### Step 1.1: Get Test MATIC
1. Open https://faucet.polygon.technology/
2. Make sure you're on **Polygon Amoy** network
3. Enter your wallet address
4. Click "Send Me MATIC"
5. Wait for confirmation (should arrive in 1-2 minutes)

### Step 1.2: Setup Blockchain Environment
1. Open `blockchain/.env` file
2. Add your values:
   ```env
   PRIVATE_KEY=your_private_key_without_0x
   RPC_URL_AMOY=https://rpc-amoy.polygon.technology
   ```
   
   **How to get Private Key?**
   - MetaMask: Account Details > Export Private Key
   - DO NOT share this with anyone!

3. Save the file

### Step 1.3: Deploy Contract
```bash
# Open PowerShell in blockchain folder
cd d:\decentralised voting system\blockchain

# Install dependencies
npm install

# Deploy to Amoy
npx hardhat run scripts/deploy.js --network amoy
```

**Expected Output:**
```
Contract deployed to: 0x1234567890abcdef...
Saved address for amoy
```

**SAVE THIS ADDRESS!** You'll need it next.

---

## Part 2: MongoDB Atlas Setup

### Step 2.1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create organization & project

### Step 2.2: Create Cluster
1. Click "Create Deployment"
2. Choose **M0 (Free)** tier
3. Select provider: **AWS**
4. Select region: **us-east-1** (or closest to your users)
5. Click "Create Deployment"
6. Wait 5-10 minutes for cluster to be ready

### Step 2.3: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Create username and password (save these!)
4. Select role: **Atlas admin**
5. Click **Add User**

### Step 2.4: Whitelist IP
1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For development: Add your IP or click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click **Confirm**

### Step 2.5: Get Connection String
1. Go to **Databases** → Click **Connect**
2. Choose **Drivers**
3. Copy connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Replace `myFirstDatabase` with `voting_db`

**Example:**
```
mongodb+srv://votingadmin:password123@cluster0.abcdef.mongodb.net/voting_db
```

---

## Part 3: Backend Setup & Deployment

### Step 3.1: Configure Backend Environment
1. Open `backend/.env` file
2. Fill in your values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voting_db
   POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
   POLYGON_VOTING_CONTRACT=0x1234567890abcdef...
   CORS_ORIGIN=http://localhost:3000
   ```
   
   Replace `0x1234567890abcdef...` with the contract address from Step 1.3

### Step 3.2: Test Backend Locally
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully ✅
```

### Step 3.3: Test Backend API
Open a new terminal and test:
```bash
curl http://localhost:5000/
# Should return: "Backend running successfully 🚀"

curl -X GET "http://localhost:5000/api/voters/lookup?aadharNumber=123456789012"
# Should return error (no voter), which is OK - means API is working
```

### Step 3.4: Prepare for Production
1. Update `backend/package.json` to have proper start script ✅ (already done)
2. Ensure all environment variables are documented

### Step 3.5: Push to GitHub
```bash
cd d:\decentralised voting system

# Initialize Git (if not already done)
git init

# Create .gitignore
echo "
node_modules/
.env
*.log
.DS_Store
build/
dist/
" > .gitignore

# Add and commit
git add .
git commit -m "Initial Polygon Amoy deployment setup"

# Create GitHub repository first at github.com/new
# Then:
git remote add origin https://github.com/yourusername/voting-system.git
git branch -M main
git push -u origin main
```

---

## Part 4: Deploy Backend on Render

### Step 4.1: Create Render Account
1. Go to https://render.com
2. Click **Sign up with GitHub**
3. Authorize Render to access your GitHub

### Step 4.2: Create Web Service
1. From dashboard, click **New +** → **Web Service**
2. Select your repository: `voting-system` (or whatever you named it)
3. Click **Connect**

### Step 4.3: Configure Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | voting-system-backend |
| **Environment** | Node |
| **Region** | Choose closest to users |
| **Branch** | main |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |

### Step 4.4: Add Environment Variables
Click **Advanced** → **Add Environment Variable** for each:

```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/voting_db
POLYGON_RPC_URL = https://rpc-amoy.polygon.technology
POLYGON_VOTING_CONTRACT = 0x1234567890abcdef...
NODE_ENV = production
CORS_ORIGIN = http://localhost:3000
```

Update `CORS_ORIGIN` after frontend deployment.

### Step 4.5: Deploy
1. Click **Create Web Service**
2. Wait 3-5 minutes for deployment
3. Check logs for errors
4. You'll get a URL like: `https://voting-system-backend.onrender.com`

**SAVE THIS URL!**

---

## Part 5: Frontend Configuration

### Step 5.1: Update API URL
1. Open `frontend/script.js`
2. Find line with `const API_BASE =`
3. Update to your Render URL:
   ```javascript
   const API_BASE = "https://voting-system-backend.onrender.com/api";
   ```

### Step 5.2: Test Frontend Locally
1. Open `frontend/index.html` in your browser
2. Try to register a voter
3. Check browser console (F12) for any errors
4. Check that data appears in MongoDB Atlas

---

## Part 6: Deploy Frontend

### Option A: GitHub Pages (Free, Simple)

1. Create new repository: `yourusername.github.io`
2. Copy frontend files to local `yourusername.github.io` folder
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy voting app"
   git push origin main
   ```
4. Access at: `https://yourusername.github.io`

### Option B: Netlify (Recommended)

1. Go to https://netlify.com
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - Leave other fields empty
6. Click **Deploy**
7. You'll get a URL like: `https://voting-app.netlify.app`

---

## Part 7: Final Configuration & Testing

### Step 7.1: Update Backend CORS
1. Open `backend/.env`
2. Update:
   ```env
   CORS_ORIGIN=https://your-netlify-or-github-url.com
   ```
3. Redeploy on Render (automatic on push, or manual redeploy)

### Step 7.2: Test Everything
1. ✅ Visit your frontend URL
2. ✅ Register a voter with test data
3. ✅ Check MongoDB Atlas - voter should appear
4. ✅ Sign in with that voter's Aadhar
5. ✅ Register an election (if admin endpoint exists)
6. ✅ Register a candidate
7. ✅ Cast a vote
8. ✅ Check Amoy Polygonscan: https://amoy.polygonscan.com/
   - Search for your transaction
   - Verify vote recorded on blockchain

### Step 7.3: Check Logs
- **Backend Logs**: Render dashboard → select service → "Logs"
- **Frontend Console**: Browser DevTools (F12) → Console tab
- **Contract Logs**: Amoy Polygonscan → search address

---

## Troubleshooting

### "Contract deployment fails"
- [ ] Verify you have test MATIC in wallet
- [ ] Check RPC URL is correct
- [ ] Verify private key format (no 0x prefix)

### "MongoDB connection failed"
- [ ] Check connection string is correct
- [ ] Verify database user password
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Ensure database name is correct (voting_db)

### "Backend won't deploy on Render"
- [ ] Check build logs for errors
- [ ] Verify Node version in package.json
- [ ] Ensure all env variables are set
- [ ] Check .gitignore doesn't exclude important files

### "Frontend can't reach backend"
- [ ] Verify API_BASE URL is correct
- [ ] Check CORS is enabled in backend
- [ ] Browser console (F12) should show network errors
- [ ] Test API directly: curl from backend URL

### "Vote not recording"
- [ ] Verify contract address is correct
- [ ] Check MongoDB connection is working
- [ ] Look at backend logs for errors
- [ ] Ensure Polygon network is Amoy

---

## Next Steps

### For Production Deployment:
1. Deploy to **Polygon Mainnet** (requires real MATIC, not testnet)
2. Update all RPC URLs from Amoy to Mainnet
3. Use production database (not free tier)
4. Setup SSL/HTTPS
5. Enable rate limiting on API
6. Setup monitoring and alerting

### For Additional Features:
1. Add admin dashboard
2. Add candidate registration UI
3. Add vote verification system
4. Add election results page
5. Add audit logging

---

## Important Security Notes

⚠️ **Never commit sensitive data!**
- Never share private keys
- Never commit `.env` files
- Use environment variables for secrets
- Rotate keys if compromised

⚠️ **Database Security**
- Don't use simple passwords
- Whitelist specific IPs in production
- Enable two-factor authentication
- Regular backups

⚠️ **Smart Contract Security**
- Test thoroughly on testnet first
- Consider code audit before mainnet
- Never modify contract logic after deployment (immutable)
- Keep contract ABIs private

---

## Support Resources

- Polygon Docs: https://wiki.polygon.technology/
- Hardhat Docs: https://hardhat.org/
- MongoDB Docs: https://docs.mongodb.com/
- Render Docs: https://render.com/docs
- Ethers.js Docs: https://docs.ethers.org/

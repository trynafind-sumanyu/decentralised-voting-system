# Polygon Deployment Checklist

## Pre-Deployment
- [ ] Have wallet private key ready
- [ ] Have test MATIC in wallet (request from faucet)
- [ ] Create MongoDB Atlas account
- [ ] Create GitHub account
- [ ] Create Render account
- [ ] Create Netlify/GitHub Pages account (for frontend)

## Smart Contract Deployment (Blockchain)
- [ ] Set up `.env` in `blockchain/` folder with PRIVATE_KEY and RPC_URL_AMOY
- [ ] Run `npx hardhat run scripts/deploy.js --network amoy`
- [ ] Save deployed contract address
- [ ] Verify contract on Amoy Polygonscan

## Backend Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Create database user
- [ ] Get MongoDB connection string
- [ ] Set up `.env` in `backend/` folder with:
  - `MONGO_URI`
  - `POLYGON_VOTING_CONTRACT` (from step above)
  - `POLYGON_RPC_URL`
- [ ] Test locally: `npm run dev`
- [ ] Push backend to GitHub
- [ ] Deploy on Render:
  - [ ] Connect GitHub repo
  - [ ] Set environment variables
  - [ ] Deploy
  - [ ] Save Render backend URL

## Backend Configuration
- [ ] Update `backend/config/blockchain.js` to use env variables
- [ ] Verify CORS is configured properly
- [ ] Test API endpoints locally

## Frontend Setup
- [ ] Update `frontend/script.js` API_BASE to Render URL
- [ ] Update contract address reference (if needed)
- [ ] Update Polygon network to Amoy
- [ ] Test all functions locally first

## Frontend Deployment
- [ ] Push frontend code to GitHub
- [ ] Deploy on Netlify or GitHub Pages
- [ ] Update backend CORS_ORIGIN with frontend URL
- [ ] Redeploy backend on Render

## Final Testing
- [ ] Visit frontend URL
- [ ] Register a voter
- [ ] Check MongoDB Atlas for data
- [ ] Sign in and cast a vote
- [ ] Check Amoy Polygonscan for transaction
- [ ] Verify vote recorded in blockchain

## Production (Optional - when ready)
- [ ] Deploy contract to Polygon Mainnet
- [ ] Update all RPC URLs to mainnet
- [ ] Set up proper error logging
- [ ] Add rate limiting to API
- [ ] Setup SSL certificate
- [ ] Monitor and backup database

---

## Quick Command Reference

### Deploy Contract
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network amoy
```

### Test Backend Locally
```bash
cd backend
npm install
npm run dev
```

### Push to GitHub
```bash
git add .
git commit -m "Polygon deployment"
git push origin main
```

---

## Useful Addresses
- Amoy Faucet: https://faucet.polygon.technology/
- Amoy Explorer: https://amoy.polygonscan.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render: https://render.com
- Netlify: https://netlify.com

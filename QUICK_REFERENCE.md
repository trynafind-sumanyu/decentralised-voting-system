# Deployment Quick Reference Card

## 📋 Before You Start
- [ ] Wallet with private key ready
- [ ] GitHub account
- [ ] Render account (connect with GitHub)
- [ ] MongoDB Atlas account
- [ ] Browser with MetaMask installed

---

## 🔗 Key Links (Bookmark These!)

| Purpose | URL |
|---------|-----|
| Get Test MATIC | https://faucet.polygon.technology/ |
| Monitor Contract | https://amoy.polygonscan.com/ |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| Render Dashboard | https://dashboard.render.com |
| Your GitHub Repos | https://github.com |

---

## 📝 Key Information to Save

```
BLOCKCHAIN DEPLOYMENT
├── Contract Address: ___________________________
├── Network: Polygon Amoy
├── Explorer: https://amoy.polygonscan.com/address/___
└── Deployed Date: ___/___/___

BACKEND DEPLOYMENT
├── Render URL: https://voting-system-backend.onrender.com
├── MongoDB Connection: mongodb+srv://user:pass@...
├── Status: ✅ Running / ❌ Failed
└── Deployed Date: ___/___/___

FRONTEND DEPLOYMENT
├── URL: https://your-domain.com
├── API Base: https://voting-system-backend.onrender.com/api
├── Status: ✅ Running / ❌ Failed
└── Deployed Date: ___/___/___
```

---

## ⚡ Quick Commands

### Deploy Smart Contract
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network amoy
```

### Test Backend Locally
```bash
cd backend
npm run dev
```

### Push to GitHub
```bash
git add .
git commit -m "Deployment update"
git push origin main
```

### Check Logs (Render)
1. Go to https://dashboard.render.com
2. Select voting-system-backend service
3. Click "Logs" tab
4. Scroll to see latest activity

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Contract deploy fails | Check PRIVATE_KEY and test MATIC balance |
| MongoDB connection error | Verify connection string & IP whitelist |
| Backend won't deploy | Check all env variables are set in Render |
| Frontend can't reach API | Verify CORS_ORIGIN in backend matches frontend URL |
| Vote not recording | Ensure contract address matches deployed address |

---

## ✅ Deployment Checklist

### Blockchain
- [ ] Private key in `.env`
- [ ] Test MATIC in wallet
- [ ] Run: `npx hardhat run scripts/deploy.js --network amoy`
- [ ] Save contract address

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelisted
- [ ] Connection string copied

### Backend
- [ ] `.env` file configured
- [ ] Local test: `npm run dev`
- [ ] Pushed to GitHub
- [ ] Deployed on Render
- [ ] All env variables set

### Frontend
- [ ] API_BASE updated to Render URL
- [ ] Deployed on Netlify/GitHub Pages
- [ ] Can reach backend API
- [ ] Can register and vote

---

## 🔐 Environment Variables Template

**blockchain/.env:**
```env
PRIVATE_KEY=abc123def456...
RPC_URL_AMOY=https://rpc-amoy.polygon.technology
```

**backend/.env:**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/voting_db
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_VOTING_CONTRACT=0x1234567890abcdef
CORS_ORIGIN=https://your-frontend-url.com
```

---

## 📊 Test Scenarios

### Scenario 1: Register & Vote
```
1. Open frontend
2. Click "Register" → Select "Voter"
3. Fill: Name, Email, Aadhar (12 digits), DOB
4. Click "Register"
5. Check MongoDB Atlas - voter should appear
6. Sign in with Aadhar
7. Cast vote
8. Check Amoy Polygonscan for transaction ✅
```

### Scenario 2: Test Multiple Voters
```
1. Register voter #1
2. Click "Return to Welcome"
3. Register voter #2 (different email & aadhar)
4. Sign in as voter #2
5. Should work without conflicts ✅
```

---

## 🎯 Success Criteria

- ✅ Contract deployed to Amoy (visible on Polygonscan)
- ✅ Backend running on Render (responds to API calls)
- ✅ Frontend accessible (can open in browser)
- ✅ MongoDB storing voter data (visible in Atlas)
- ✅ Can register voters without errors
- ✅ Can cast votes (transactions on Polygonscan)
- ✅ No CORS errors in browser console
- ✅ No connection errors in backend logs

---

## 📞 When Something Goes Wrong

1. **Check the logs first!**
   - Render logs for backend errors
   - Browser console (F12) for frontend errors
   - MongoDB Atlas for connection issues

2. **Verify environment variables**
   - Make sure all keys are set in Render
   - Check for typos in connection strings
   - Ensure contract address is correct

3. **Test components individually**
   - Test backend locally: `npm run dev`
   - Test contract on Amoy: verify on Polygonscan
   - Test database: connect to MongoDB Atlas directly

4. **Check network connectivity**
   - Can you reach Amoy RPC? 
   - Can you reach MongoDB Atlas?
   - Is CORS configured correctly?

---

## 📚 Useful Resources

- **Amoy Network Info**: Chain ID: 80002, Block time: ~2 seconds
- **Ethers.js V6 Docs**: https://docs.ethers.org/v6/
- **Hardhat Docs**: https://hardhat.org/docs
- **MongoDB Query Docs**: https://docs.mongodb.com/manual/tutorial/query-documents/

---

## 🎉 You're Done When:

```
✅ Contract deployed to Polygon Amoy
✅ Backend running on Render with MongoDB Atlas
✅ Frontend accessible at production URL
✅ Can register voters
✅ Can cast votes with blockchain confirmation
✅ All data persisting correctly
✅ No console errors or warnings

🚀 Project Live on Polygon!
```

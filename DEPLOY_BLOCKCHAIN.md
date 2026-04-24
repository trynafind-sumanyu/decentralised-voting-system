# Step-by-Step: Deploy Smart Contract to Polygon Amoy

## Step 1: Get Your Private Key from MetaMask

### On MetaMask:
1. Click on your profile icon (top-right)
2. Select **Account Details**
3. Click **Export Private Key**
4. Enter your MetaMask password
5. Copy the private key (looks like: `abc123def456...`)

⚠️ **IMPORTANT:**
- NEVER share this private key
- NEVER post it online
- It will be deleted from your .env after successful deployment

---

## Step 2: Create .env File for Blockchain

1. Open `blockchain/.env.example` file
2. Save it as `.env` (replace the existing one if needed)
3. Fill in your values:

```env
PRIVATE_KEY=paste_your_metamask_private_key_here
RPC_URL_AMOY=https://rpc-amoy.polygon.technology
```

**Example (DO NOT USE THIS):**
```env
PRIVATE_KEY=abc123def456789abc123def456789abc123def456789abc123def456789abc1
RPC_URL_AMOY=https://rpc-amoy.polygon.technology
```

---

## Step 3: Deploy Contract

### Open PowerShell in blockchain folder:
```powershell
cd "d:\decentralised voting system\blockchain"
```

### Deploy to Amoy:
```powershell
npx hardhat run scripts/deploy.js --network amoy
```

### Expected Output:
```
Contract deployed to: 0x1234567890abcdef1234567890abcdef12345678
Saved address for amoy
```

**🎉 SAVE THIS ADDRESS!** This is your contract address.

---

## Step 4: Verify Deployment on Polygonscan

1. Go to: https://amoy.polygonscan.com/
2. Search for your contract address (from step 3)
3. You should see:
   - ✅ Your contract address
   - ✅ Deployment transaction
   - ✅ Contract code (Voting.sol)
   - ✅ Your wallet address as creator

---

## Step 5: Update Backend Configuration

1. Open `backend/.env`
2. Update with your deployed contract address:

```env
POLYGON_VOTING_CONTRACT=0x1234567890abcdef1234567890abcdef12345678
```

(Replace with your actual contract address from Step 3)

---

## Step 6: Test Contract Interaction

The contract is now live! You can:
- ✅ Register voters (stored in MongoDB)
- ✅ Cast votes (recorded on blockchain)
- ✅ View vote transactions on Amoy Polygonscan

---

## Quick Commands Summary

```powershell
# 1. Navigate to blockchain folder
cd "d:\decentralised voting system\blockchain"

# 2. Deploy contract
npx hardhat run scripts/deploy.js --network amoy

# 3. Copy the contract address
# (It will be printed in console)

# 4. Update backend/.env with this address

# 5. You're done! 🚀
```

---

## If Deployment Fails

### Error: "Insufficient funds"
- ✅ Get more test MATIC from: https://faucet.polygon.technology/
- ✅ Wait a few minutes and try again

### Error: "Invalid private key"
- ✅ Make sure PRIVATE_KEY is correct (no 0x prefix)
- ✅ Copy from MetaMask exactly as shown
- ✅ No spaces at beginning/end

### Error: "Network error"
- ✅ Check internet connection
- ✅ Verify RPC URL is correct
- ✅ Try different RPC: https://polygon-amoy.g.alchemy.com/v2/demo

### Error: "Contract already deployed"
- ✅ You can deploy multiple times
- ✅ Each deployment creates a new contract address
- ✅ Update backend/.env with the latest address

---

## What Happens When You Deploy?

1. **Compilation**: Smart contract is compiled to bytecode
2. **Transaction**: Deployment transaction sent to Amoy network
3. **Confirmation**: Miners confirm the transaction
4. **Storage**: Contract code stored on blockchain
5. **Address Generated**: Unique contract address created
6. **JSON Saved**: Contract address saved to `deployedAddresses.json`

---

## After Deployment - Next Steps

1. ✅ **Update backend**: Add contract address to `.env`
2. ✅ **Start backend**: `npm run dev` in backend folder
3. ✅ **Open frontend**: Visit `frontend/index.html`
4. ✅ **Register voters**: Test the system
5. ✅ **Cast vote**: Verify blockchain transaction on Polygonscan
6. ✅ **Deploy to Render**: Push to GitHub and deploy

---

## Viewing Your Contract on Polygonscan

1. Go to https://amoy.polygonscan.com/
2. Paste your contract address
3. You'll see:
   - **Code** tab: Your smart contract source
   - **Transactions** tab: All votes cast
   - **Internal Txns** tab: Contract calls
   - **Holders** tab: Token transfers (if any)

---

## Contract Functions (What You Can Do)

Once deployed, the contract has these functions:

```solidity
// Record a vote
recordVote(voter, candidateId, electionId)

// Check if already voted
hasVoted(voter, electionId)

// Get election info
getElection(electionId)

// Get candidate info
getCandidate(candidateId)
```

These are called automatically by your backend API!

---

## Security Reminder

⚠️ After successful deployment:
1. Delete the private key from `.env`
2. Never share your private key
3. Generate new wallet for different environments
4. Keep contract address safe (but it's OK to share)

---

## Troubleshooting Commands

```powershell
# Check Hardhat version
npx hardhat --version

# List available networks
npx hardhat networks

# Get account balance
npx hardhat accounts

# Check contract address
cat blockchain/deployedAddresses.json

# View transaction
# Go to: https://amoy.polygonscan.com/tx/[TRANSACTION_HASH]
```

---

## Success Checklist

- [ ] Deployed contract to Amoy
- [ ] Contract address is printed in console
- [ ] Contract address is on Polygonscan
- [ ] Updated backend/.env with contract address
- [ ] Backend can start without errors
- [ ] Frontend can register voters
- [ ] Votes appear on blockchain
- [ ] Polygonscan shows your transactions

---

Ready to deploy? Follow the commands above! 🚀

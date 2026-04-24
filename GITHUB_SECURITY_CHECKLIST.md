# ⚠️ SECURITY CHECKLIST - BEFORE PUSHING TO GITHUB

## 🔐 Critical Actions Required

### Step 1: Regenerate Private Keys ⚠️
**Your current private keys are in `.env` files in this directory!** Anyone with access to your computer could see them. You MUST regenerate them after deploying:

**For Polygon Amoy Testnet:**
1. Create a NEW wallet (MetaMask or similar)
2. Get test MATIC from faucet
3. Update your `.env` with NEW private key
4. Deploy contract with NEW wallet
5. Delete old private key from machine

**Why?** Even though `.env` will be ignored by Git, the private key is still visible on your local machine in plaintext.

### Step 2: Verify .gitignore Protection
These files are NOW protected by .gitignore:
- ✅ `.env` (all environment files)
- ✅ `node_modules/` (dependencies)
- ✅ `.git` folders
- ✅ `artifacts/` and `cache/` (build outputs)
- ✅ `logs/`

### Step 3: Clean Sensitive Data From Project
Before pushing, manually delete or clear:
- [ ] `backend/.env` - Replace with real values later, or keep `.env.example` as template
- [ ] `blockchain/.env` - Same as above
- [ ] Any `.env.local` files

### Step 4: Initialize Git Safely
```bash
cd d:\decentralised voting system
git init
git add .
git commit -m "Initial commit - before deployment"
# Do NOT push yet - verify first!
```

### Step 5: Verify Nothing Sensitive Is Staged
```bash
git status
# Should NOT show .env files
# Should NOT show node_modules/
```

---

## ✅ Safe Files to Commit

These are SAFE to commit:
- ✅ `.env.example` files (templates only, no real values)
- ✅ `package.json` & `package-lock.json`
- ✅ Source code (`.js`, `.ts`, `.sol`)
- ✅ `hardhat.config.ts` (no secrets in it)
- ✅ Markdown files (`.md`)
- ✅ Configuration files (`tsconfig.json`)
- ✅ Contract artifacts (after testing)

---

## ❌ NEVER Commit These

- ❌ `.env` files with real credentials
- ❌ Private keys (ANY private keys)
- ❌ Database passwords
- ❌ API keys
- ❌ `node_modules/` folder
- ❌ Build output folders

---

## 🚀 Safe Initialization Steps

```bash
# 1. Remove sensitive data
cd d:\decentralised voting system

# 2. Delete or rename real .env files (keep .env.example as reference)
# Option A: Delete them
rm backend\.env
rm blockchain\.env

# Option B: Or rename them temporarily
# ren backend\.env backend\.env.backup
# ren blockchain\.env blockchain\.env.backup

# 3. Initialize Git
git init

# 4. Add all files (will ignore .env files due to .gitignore)
git add .

# 5. Check what will be committed
git status

# 6. Commit
git commit -m "Initial commit: Decentralized Voting System for Polygon Amoy"

# 7. Create GitHub repository at github.com/new
# 8. Add remote
git remote add origin https://github.com/yourusername/voting-system.git

# 9. Push (ONLY after verifying no sensitive files!)
git branch -M main
git push -u origin main
```

---

## 🔍 Verification Checklist

Before executing `git push`, verify:

- [ ] No `.env` files will be pushed (check with `git status`)
- [ ] No `node_modules/` folder in commit
- [ ] `.gitignore` files created in root and backend folders
- [ ] `.env.example` files exist as templates
- [ ] All `.md` documentation files included
- [ ] Source code included (controllers, models, contracts)
- [ ] `package.json` files included

Run this to double-check:
```bash
git ls-files | grep -E "\.env|node_modules"
# Should return NOTHING - if it does, don't push!
```

---

## 📋 Summary

| Item | Status | Action |
|------|--------|--------|
| Git initialized | ❌ Not yet | Run `git init` |
| `.env` protection | ✅ Protected | .gitignore created |
| Private keys secure | ⚠️ Exposed locally | Regenerate after deployment |
| `.env.example` files | ✅ Ready | Templates for deployment |
| Ready to push | ❌ Not yet | Follow steps above first |

---

## 🎯 You Can Safely Push When:

1. ✅ `.env` files are either deleted or renamed
2. ✅ `.gitignore` is properly configured
3. ✅ `git status` shows NO `.env` files
4. ✅ `git ls-files` shows NO sensitive data
5. ✅ GitHub repository created
6. ✅ Remote added with `git remote add origin`

---

## 🔗 Next Steps After Pushing

1. Create GitHub repository at: https://github.com/new
2. Choose public or private repository
3. Add this in your project:
   ```bash
   git remote add origin https://github.com/yourusername/voting-system.git
   git push -u origin main
   ```
4. From Render dashboard, it will auto-detect the GitHub repo
5. Re-deploy automatically when you push changes

---

## ⚠️ If You Already Pushed Sensitive Data

If you accidentally pushed `.env` with credentials:
1. **Immediately rotate** all credentials:
   - Change MongoDB Atlas password
   - Create new Polygon wallet + private key
   - Regenerate API keys
2. Remove file from git history:
   ```bash
   git rm --cached backend/.env
   git commit --amend --no-edit
   git push --force-with-lease origin main
   ```
3. Add `.env` to `.gitignore`
4. Commit the fix

---

**Status: ⚠️ NOT READY TO PUSH - Follow steps above first!**

# 🔧 Vercel Build Fix - Lockfile Update

## ⚠️ Problem

Vercel build is failing because `pnpm-lock.yaml` is outdated. I added 3 new dependencies to `package.json`:
- `clsx@^2.1.0`
- `framer-motion@^11.0.0`  
- `tailwind-merge@^2.2.0`

But the lockfile wasn't updated.

---

## ✅ Solution (Choose One)

### **Option 1: Disable Frozen Lockfile in Vercel (Quickest)**

1. Go to https://vercel.com/dashboard
2. Select your **TrackMyOPT** project
3. Go to **Settings** → **General**
4. Scroll to **Build & Development Settings**
5. Find **Install Command**
6. Change from: `pnpm install`
7. Change to: `pnpm install --no-frozen-lockfile`
8. Click **Save**
9. Go to **Deployments** and click **Redeploy**

This will let pnpm update the lockfile automatically.

---

### **Option 2: Update Lockfile Locally (Recommended)**

You need Node.js and pnpm installed:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Navigate to web directory
cd web

# Update lockfile
pnpm install

# Commit and push
cd ..
git add pnpm-lock.yaml
git commit -m "chore: Update pnpm lockfile for new dependencies"
git push origin main
```

---

### **Option 3: Use npm instead of pnpm**

If you want to switch to npm:

1. Go to Vercel **Settings** → **General**
2. Find **Build & Development Settings**
3. Change **Install Command** to: `npm install`
4. Change **Build Command** to: `npm run build`
5. Save and redeploy

---

## 📝 Temporary Workaround

I'll create a commit that tells Vercel to use `--no-frozen-lockfile` automatically.

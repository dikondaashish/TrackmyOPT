# 🐛 Debug: User Email Not Showing

## Step 1: Check Browser Console NOW

1. **Open your dashboard:** https://www.trackmyopt.com/dashboard
2. **Open DevTools:** Press `F12` or `Right-click → Inspect`
3. **Go to Console tab**
4. **Look for these logs:**

### What you SHOULD see:
```
🔄 Starting user data fetch...
📡 API /me response status: 200
✅ Full API response: {user: {...}, profile: {...}}
👤 User object: {id: "...", email: "your@email.com", ...}
📧 User email: your@email.com
✅ User state set to: your@email.com
```

### What logs do you ACTUALLY see?

**Copy and paste the ENTIRE console output here:**
```
[PASTE YOUR CONSOLE LOGS HERE]
```

---

## Step 2: Check Network Tab

1. Stay in DevTools
2. Click **Network** tab
3. Reload the page (`Ctrl+R` or `Cmd+R`)
4. Look for `/api/me` request
5. Click on it
6. Go to **Response** tab

### What should you see:
```json
{
  "user": {
    "id": "...",
    "email": "your@email.com",
    "user_metadata": {...}
  },
  "profile": {...},
  "status": {...}
}
```

### What do you ACTUALLY see?

**Copy the response:**
```
[PASTE /api/me RESPONSE HERE]
```

---

## Step 3: Check if You're Logged In

In DevTools Console, run this:
```javascript
document.cookie
```

**Do you see cookies with `sb-` prefix?**
- ✅ YES → You're logged in
- ❌ NO → You're NOT logged in (need to re-login)

---

## Common Issues & Fixes:

### Issue 1: Console shows "❌ Failed to fetch user data: 401"
**Fix:** You're not logged in
```
1. Logout completely
2. Clear cookies for trackmyopt.com
3. Login again
```

### Issue 2: Console shows "✅ User state set to: your@email.com" but sidebar still shows "U Loading..."
**Fix:** React state not updating
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private window
```

### Issue 3: No console logs at all
**Fix:** Vercel hasn't deployed yet
```
1. Wait 2-3 more minutes
2. Hard refresh
3. Check Vercel dashboard for deployment status
```

### Issue 4: /api/me returns empty user object
**Fix:** Session cookie issue
```
1. Logout
2. Clear all trackmyopt.com cookies:
   - DevTools → Application tab → Cookies → trackmyopt.com → Delete all
3. Login again
```

---

## Quick Test Commands

Run these in browser console:

### Test 1: Check if API works
```javascript
fetch('/api/me', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
```

### Test 2: Check cookies
```javascript
console.log('Cookies:', document.cookie.split(';').filter(c => c.includes('sb-')))
```

---

## 🆘 Send Me This Info:

1. **Console logs** (starting with 🔄)
2. **/api/me response** (from Network tab)
3. **Cookies check** (do you see sb- cookies?)
4. **Are you logged in?** (can you see the dashboard content?)

With this info, I can tell you EXACTLY what's wrong!

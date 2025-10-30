# Debugging Blank Screen Issue

**Date:** October 30, 2025  
**Status:** Server working, React not rendering  
**URL:** https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer

---

## What's Working

✅ Server is running correctly (PM2 status: online)  
✅ Static files are being served (HTTP 200 for all assets)  
✅ HTML is served with correct structure  
✅ JavaScript bundles load successfully  
✅ Test page (test.html) works perfectly  
✅ `<div id="root"></div>` exists in HTML  
✅ React code is compiled and included

---

## What's NOT Working

❌ React application does not render  
❌ Page shows blank screen  
❌ No visible content in the browser  
❌ No console errors (which is suspicious)

---

## Debugging Steps for Real Browser

### Step 1: Open Developer Tools

1. Open https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer in Chrome/Firefox
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### Step 2: Check for JavaScript Errors

Look for any red error messages in the console. Common issues:

- **Module loading errors** - "Failed to load module"
- **CORS errors** - "Access-Control-Allow-Origin"
- **Runtime errors** - "Cannot read property of undefined"
- **Network errors** - "Failed to fetch"

### Step 3: Check Network Tab

1. Go to **Network** tab in Developer Tools
2. Refresh the page (**Ctrl+R** or **Cmd+R**)
3. Check if all files load successfully:
   - `index.html` - Should be 200 OK
   - `index-Bk9hECbS.js` - Should be 200 OK
   - `vendor-BDjKXuQ1.js` - Should be 200 OK
   - All CSS files - Should be 200 OK

### Step 4: Check if React is Loaded

In the Console tab, type:

```javascript
React
```

If it returns `undefined`, React isn't loaded. If it returns an object, React is loaded.

### Step 5: Check if Root Element Exists

In the Console tab, type:

```javascript
document.getElementById('root')
```

Should return: `<div id="root"></div>`

If it returns `null`, the root element doesn't exist.

### Step 6: Check if React Rendered Anything

In the Console tab, type:

```javascript
document.getElementById('root').innerHTML
```

- If it returns empty string `""`, React didn't render
- If it returns HTML content, React rendered but might be invisible

### Step 7: Check for Manus Runtime Issues

In the Console tab, type:

```javascript
window.__MANUS_HOST_DEV__
```

Should return `false`. If it's `undefined` or `true`, there's an issue with the Manus runtime.

### Step 8: Force React to Render (Debug)

In the Console tab, try:

```javascript
document.getElementById('root').innerHTML = '<h1>Manual Test</h1>';
```

If this works, the problem is with React initialization, not the DOM.

---

## Common Causes & Solutions

### Cause 1: JavaScript Module Loading Issue

**Symptom:** Console shows "Failed to load module" or "Unexpected token '<'"

**Solution:**
- Check that all script tags have correct paths
- Verify MIME types are correct (should be `application/javascript`)
- Check for CORS issues

### Cause 2: React Not Initializing

**Symptom:** No errors, but `document.getElementById('root').innerHTML` is empty

**Solution:**
- Check if there's an error in `main.tsx` initialization
- Verify tRPC client is connecting correctly
- Check if there's an authentication redirect happening

### Cause 3: CSS Hiding Content

**Symptom:** React renders but nothing visible

**Solution:**
In Console, type:
```javascript
document.body.style.display = 'block';
document.getElementById('root').style.display = 'block';
```

### Cause 4: Manus Runtime Conflict

**Symptom:** `window.__MANUS_HOST_DEV__` is undefined or wrong value

**Solution:**
- Check if Manus runtime script is loading
- Verify it's not conflicting with React

---

## Quick Fixes to Try

### Fix 1: Clear Browser Cache

1. Press **Ctrl+Shift+Delete** (or **Cmd+Shift+Delete** on Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### Fix 2: Hard Refresh

Press **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac) to force reload all assets

### Fix 3: Incognito/Private Mode

Open the URL in an incognito/private window to rule out extension conflicts

---

## Server-Side Debugging

If the browser debugging doesn't reveal the issue, check server logs:

```bash
# View PM2 logs
pm2 logs terp-pm-hub --lines 50

# Check for errors
pm2 logs terp-pm-hub --err --lines 50

# Test server response
curl -I https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer

# Test JavaScript file
curl -I https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer/assets/index-Bk9hECbS.js
```

---

## What I've Verified

✅ Server is in production mode (`NODE_ENV=production`)  
✅ Static files are in `/home/ubuntu/TERP-PM-Hub/dist/public`  
✅ HTML contains `<div id="root"></div>`  
✅ JavaScript bundles are compiled and served  
✅ Test page (test.html) renders correctly  
✅ No server errors in PM2 logs  
✅ All HTTP responses are 200 OK

---

## Next Steps

1. **Follow the debugging steps above** in your real browser with Developer Tools open
2. **Report back** what you see in the Console tab
3. **Check Network tab** for any failed requests
4. **Try the quick fixes** if no obvious errors

Once you provide the console output and network status, I can pinpoint the exact issue and fix it.

---

## Test URLs

- **Main App:** https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer
- **Test Page:** https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer/test.html (should work)
- **API Health:** https://3000-iyfni6gz81iml0q8e22tq-a1ce86da.manusvm.computer/api/trpc

---

**Status:** Waiting for browser debugging results to proceed with fix.

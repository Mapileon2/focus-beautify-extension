# Chrome API Not Available - Debug Guide

## 🔍 **Error Analysis**

You're seeing: **"Chrome API Not Available - Windows API not accessible in this environment"**

This error occurs when the extension code runs outside of a proper Chrome extension context.

## 🚨 **Common Causes & Solutions**

### **Cause 1: Running in Web Browser (Not Extension)**
**Symptoms:**
- Accessing the app via `http://localhost:5173` or similar web URL
- Running in development mode with `npm run dev`

**Solution:**
- Load the extension properly in Chrome
- Use the extension popup or dashboard, not the web version

### **Cause 2: Extension Not Properly Loaded**
**Symptoms:**
- Extension appears in Chrome but APIs don't work
- Manifest errors or permission issues

**Solution:**
1. **Check Extension Status:**
   - Go to `chrome://extensions/`
   - Ensure your extension is **enabled**
   - Look for any error messages

2. **Reload Extension:**
   - Click the refresh icon on your extension
   - Or toggle it off/on

### **Cause 3: Missing Permissions in Manifest**
**Check `public/manifest.json`:**
```json
{
  "permissions": [
    "storage",
    "alarms", 
    "notifications",
    "activeTab",
    "windows"  // ← This is required for chrome.windows API
  ]
}
```

### **Cause 4: Development vs Extension Context**
**The app has multiple entry points:**
- **Web App**: `http://localhost:5173` (Chrome APIs not available)
- **Extension Popup**: Click extension icon (Chrome APIs available)
- **Extension Dashboard**: Open from popup (Chrome APIs available)

## 🔧 **How to Test Properly**

### **Method 1: Use Extension Popup**
1. **Build Extension**: `npm run build`
2. **Load in Chrome**: 
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → select `dist` folder
3. **Click Extension Icon** in Chrome toolbar
4. **Navigate to Settings** → Smile Popup tab
5. **Test External Popup** button

### **Method 2: Use Extension Dashboard**
1. **Open Extension Popup** (click icon)
2. **Click "Open Dashboard"** button
3. **Go to Settings** tab
4. **Test External Popup** button

## 🐛 **Debug Steps**

### **Step 1: Check Chrome Extension Context**
Open browser console and run:
```javascript
console.log('Chrome available:', typeof chrome !== 'undefined');
console.log('Chrome windows:', typeof chrome?.windows !== 'undefined');
console.log('Chrome runtime:', typeof chrome?.runtime !== 'undefined');
console.log('Extension ID:', chrome?.runtime?.id);
```

**Expected Results in Extension:**
```
Chrome available: true
Chrome windows: true  
Chrome runtime: true
Extension ID: [some-extension-id]
```

**Results in Web Browser:**
```
Chrome available: false (or undefined)
Chrome windows: false
Chrome runtime: false
Extension ID: undefined
```

### **Step 2: Check Current URL**
```javascript
console.log('Current URL:', window.location.href);
```

**Extension URLs look like:**
- `chrome-extension://[id]/index.html`
- `chrome-extension://[id]/dashboard.html`

**Web URLs look like:**
- `http://localhost:5173/`
- `https://your-domain.com/`

### **Step 3: Verify Extension Loading**
1. Go to `chrome://extensions/`
2. Find your "Focus Timer" extension
3. Check for:
   - ✅ **Enabled** toggle is ON
   - ✅ No error messages
   - ✅ **Inspect views** shows active pages

## 💡 **Quick Fixes**

### **Fix 1: Ensure You're Using Extension Context**
- ❌ Don't test from `localhost:5173`
- ✅ Test from extension popup/dashboard

### **Fix 2: Rebuild and Reload Extension**
```bash
npm run build
```
Then reload extension in `chrome://extensions/`

### **Fix 3: Check Manifest Permissions**
Ensure `"windows"` permission is in manifest.json

### **Fix 4: Use Correct Entry Point**
- **For Development**: Use extension popup → dashboard
- **For Testing**: Load built extension, don't use dev server

## 🎯 **Expected Behavior**

When working correctly:
- **In Extension Context**: "Test Successful - External popup window opened!"
- **In Web Context**: "Chrome API Not Available" (expected)

The error is actually **correct behavior** when running in a web browser - Chrome extension APIs are only available in extension context.

## ✅ **Verification Checklist**

- [ ] Extension built with `npm run build`
- [ ] Extension loaded in `chrome://extensions/`
- [ ] Extension is enabled
- [ ] Testing from extension popup/dashboard (not web browser)
- [ ] URL starts with `chrome-extension://`
- [ ] Console shows Chrome APIs as available
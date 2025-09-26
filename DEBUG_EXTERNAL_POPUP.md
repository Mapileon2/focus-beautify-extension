# Debug External Popup Issue

## 🔍 **Debugging Steps**

I've added comprehensive debugging to identify why the external popup isn't working. Follow these steps:

### **Step 1: Rebuild and Reload**
```bash
npm run build
```
Then reload the extension in Chrome (`chrome://extensions/` → reload button).

### **Step 2: Check Permissions**
1. Go to `chrome://extensions/`
2. Find Focus Timer extension
3. Click "Details"
4. Check if "Windows" permission is listed
5. If not, the extension needs to be reloaded

### **Step 3: Enable External Popup**
1. Open extension → Dashboard → Settings → Smile Popup tab
2. Toggle "Show as External Window" ON
3. You should see a "Test External Popup" button appear

### **Step 4: Test External Popup Manually**
1. Click the "Test External Popup" button
2. Check what happens:
   - **Success**: External window opens with celebration
   - **Error**: Toast notification shows the error message

### **Step 5: Check Console Logs**
1. Open browser console (F12 → Console)
2. Start a short timer (1 minute for testing)
3. When timer completes, look for these debug messages:
   ```
   Timer completed! Checking popup settings: {showAsExternalWindow: true, enabled: true}
   Opening external smile popup...
   Opening external popup with dimensions: {width: 400, height: 300}
   Popup params: sessionType=focus&sessionCount=1
   Using Chrome windows API...
   Popup URL: chrome-extension://[id]/smile-popup.html?sessionType=focus&sessionCount=1
   Window created successfully: [window object]
   ```

### **Step 6: Common Issues & Solutions**

#### **Issue A: "Chrome windows API not available"**
**Cause**: Extension doesn't have windows permission
**Solution**: 
1. Check manifest.json has "windows" in permissions
2. Reload extension completely
3. May need to remove and re-add extension

#### **Issue B: "Failed to create window: [error]"**
**Cause**: Chrome API error
**Solutions**:
- Check if popup blockers are enabled
- Try different window dimensions
- Check if too many windows are open

#### **Issue C: "Settings not loading"**
**Cause**: Storage issues
**Solution**: 
1. Go to Settings → Privacy → "Clear Storage"
2. Reconfigure external popup settings

#### **Issue D: External window opens but shows error**
**Cause**: smile-popup.html not loading correctly
**Solution**:
1. Check if smile-popup.html exists in dist folder
2. Verify web_accessible_resources in manifest
3. Check console in external window for errors

### **Step 7: Manual URL Test**
Try opening this URL directly in browser:
```
chrome-extension://[your-extension-id]/smile-popup.html?sessionType=focus&sessionCount=1
```
Replace `[your-extension-id]` with your actual extension ID.

### **Step 8: Fallback Test**
If Chrome API fails, test the fallback:
1. Open browser console
2. Run this code:
```javascript
window.open(
  '/smile-popup?sessionType=focus&sessionCount=1',
  'smilePopup',
  'width=400,height=300,left=100,top=100,resizable=no'
);
```

### **Expected Working Flow:**
1. Timer completes → Console shows "Timer completed!"
2. Settings check → Shows external window enabled
3. Chrome API call → Shows "Using Chrome windows API..."
4. Window creation → Shows "Window created successfully"
5. External popup opens with celebration content

### **Most Likely Issues:**
1. **Permissions**: Windows permission not granted
2. **Manifest**: Incorrect popup path or permissions
3. **Settings**: External window not actually enabled
4. **Chrome API**: Extension context issues

### **Quick Fixes to Try:**
1. **Reload Extension**: Complete reload in chrome://extensions/
2. **Clear Storage**: Use the "Clear Storage" button in settings
3. **Re-enable Feature**: Toggle external window off and on again
4. **Test Button**: Use the "Test External Popup" button first

Follow these steps and share the console output to identify the exact issue!
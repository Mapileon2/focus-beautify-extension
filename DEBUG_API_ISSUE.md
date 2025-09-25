# Debug API Issue - Step by Step

## 🔍 **Debugging Steps**

I've added debugging logs to help identify the exact issue. Follow these steps:

### **Step 1: Rebuild and Reload**
```bash
npm run build
```
Then reload the extension in Chrome.

### **Step 2: Open Browser Console**
1. Open extension → Dashboard → AI Assistant tab
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Keep it open for the next steps

### **Step 3: Check Settings Loading**
1. Look for console messages starting with "Debug - useGeminiSettings loadSettings:"
2. This will show if the API key and model are being loaded correctly

### **Step 4: Test API Call**
1. Try sending a message in AI Assistant
2. Look for these console messages:
   - "Debug - API Key: Present/Missing"
   - "Debug - Model: [model name]"
   - "Debug - Is Configured: true/false"
   - "Debug - generateGeminiResponse called with:"
   - Either "Debug - Gemini response received:" or "Debug - Gemini API error:"

### **Step 5: Check for Common Issues**

#### **Issue A: API Key Not Loading**
If you see "Debug - API Key: Missing":
- Go to Settings → AI tab
- Re-enter and save your API key
- Check if "API Key Valid ✅" appears

#### **Issue B: Model Not Loading**
If you see "Debug - Model: null":
- Go to Settings → AI tab
- Click "Test & Load Models"
- Select a model and save

#### **Issue C: API Call Failing**
If you see "Debug - Gemini API error:":
- Check the error message for details
- Common issues:
  - Invalid API key
  - Model not available
  - Rate limiting
  - Network issues

### **Step 6: Manual Verification**

#### **Check localStorage Directly:**
In browser console, run:
```javascript
console.log('API Key:', localStorage.getItem('gemini_api_key'));
console.log('Model:', localStorage.getItem('gemini_model'));
```

#### **Test API Key Manually:**
```javascript
// Replace YOUR_API_KEY with your actual key
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY')
  .then(r => r.json())
  .then(d => console.log('API Test:', d))
  .catch(e => console.error('API Test Error:', e));
```

### **Step 7: Common Solutions**

#### **Solution 1: Clear and Reconfigure**
```javascript
// Clear existing settings
localStorage.removeItem('gemini_api_key');
localStorage.removeItem('gemini_model');
// Then reconfigure in Settings
```

#### **Solution 2: Check API Key Format**
- API key should start with "AIza"
- Should be about 39 characters long
- No spaces or extra characters

#### **Solution 3: Try Different Model**
- If current model fails, try "gemini-1.5-flash"
- Some models might not be available in your region

### **Step 8: Report Findings**

Please share the console output showing:
1. The "Debug - useGeminiSettings loadSettings:" message
2. The "Debug - generateGeminiResponse called with:" message  
3. Any error messages from "Debug - Gemini API error:"

This will help identify the exact cause of the issue.

### **Expected Working Output:**
```
Debug - useGeminiSettings loadSettings: {apiKey: "AIza1234567...", model: "gemini-1.5-flash", isConfigured: true}
Debug - API Key: Present
Debug - Model: gemini-1.5-flash
Debug - Is Configured: true
Debug - generateGeminiResponse called with: {apiKey: "AIza1234567...", message: "Hello...", modelName: "gemini-1.5-flash"}
Debug - Gemini response received: Hello! I'm here to help...
```

### **Common Error Patterns:**

1. **"API Key: Missing"** = Settings not saved properly
2. **"Model: null"** = Model not selected/saved
3. **"API error: 400"** = Invalid request (usually model name issue)
4. **"API error: 403"** = Invalid API key
5. **"API error: 429"** = Rate limit exceeded

Follow these steps and share the console output to pinpoint the exact issue!
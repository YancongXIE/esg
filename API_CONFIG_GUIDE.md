# API Configuration Guide

## Quick Fix for Current Issue

Based on error analysis, the current API key format is incorrect. Please follow these steps to fix:

### 1. Get Correct Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login to your Google account
3. Click "Create API Key"
4. Copy the generated key (should start with `AIza`)

### 2. Configure API Key

#### Method A: Create .env file (Recommended)

Create a `.env` file in the project root directory:

```env
VITE_GEMINI_API_KEY=AIzaSyYourActualGeminiAPIKeyHere
```

**Note**: Replace `AIzaSyYourActualGeminiAPIKeyHere` with your actual API key.

#### Method B: Browser Local Storage

1. Open browser developer tools (F12)
2. Run in console:

```javascript
localStorage.setItem('GEMINI_API_KEY', 'AIzaSyYourActualGeminiAPIKeyHere');
```

### 3. Verify Configuration

Run test script to verify API key:

```bash
# Using environment variable
GEMINI_API_KEY=your_key node test-gemini-simple.js

# Or as parameter
node test-gemini-simple.js your_key
```

### 4. Restart Application

```bash
npm run dev
```

## Problem Diagnosis

### Current Issue
- **Error**: API key format incorrect
- **Cause**: Used Google Maps API key instead of Gemini API key
- **Solution**: Need to obtain dedicated Gemini API key

### API Key Format Comparison

| Service Type | Prefix | Example |
|---------|------|------|
| Gemini API | `AIza` | `AIzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs` |
| Google Maps | `IzaSy` | `IzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs` |

## Common Questions

### Q: Why do I need a dedicated Gemini API key?
A: Google's different services use different API key formats and permissions. Gemini API requires a dedicated key to access AI models.

### Q: How do I check if my API key is valid?
A: Run the `test-gemini-simple.js` script. If it returns a successful response, the key is valid.

### Q: Are there usage limits for API keys?
A: Yes, Gemini API has usage quota limits. You can view usage in Google AI Studio.

### Q: How do I protect API key security?
A: 
- Don't commit keys to version control systems
- Use environment variables to store keys
- Rotate keys regularly
- Use secure key management in production environments

## Verification Steps

1. ✅ Get correct Gemini API key (starting with `AIza`)
2. ✅ Configure API key to environment variables or local storage
3. ✅ Run test script to verify key validity
4. ✅ Restart application and test LLM functionality

## Fallback Solution

If unable to obtain Gemini API key, the application will automatically use fallback recommendation generation functionality based on rule-based analysis. 
# Gemini API Fix Guide

## Problem Diagnosis

Based on test results, the current API key has the following issues:

### 1. API Key Format Error
- **Current Key**: `IzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs`
- **Issue**: Starts with `IzaSy`, which is Google Maps API format
- **Correct Format**: Should start with `AIza`

### 2. API Key Type Error
- Current key may be Google Maps API key or other Google service key
- Gemini API requires dedicated Gemini API key

### 3. Error Response
```
API key not valid. Please pass a valid API key.
```

## Solution

### Step 1: Get Correct Gemini API Key

1. **Visit Google AI Studio**
   - Open browser, visit: https://makersuite.google.com/app/apikey
   - Login with Google account

2. **Create API Key**
   - Click "Create API Key" button
   - Select "Create API Key" option
   - Copy generated key (should start with `AIza`)

3. **Verify Key Format**
   - Correct Gemini API key format: `AIzaSy...` (39 characters)
   - Example: `AIzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs`

### Step 2: Configure API Key

#### Method A: Environment Variables (Recommended)
1. Create `.env` file in project root directory
2. Add the following content:
```env
VITE_GEMINI_API_KEY=AIzaSyYourActualGeminiAPIKeyHere
```

#### Method B: Browser Local Storage
1. Open browser developer tools (F12)
2. Run in console:
```javascript
localStorage.setItem('GEMINI_API_KEY', 'AIzaSyYourActualGeminiAPIKeyHere');
```

### Step 3: Verify Configuration

Run test script to verify API key:
```bash
# Using environment variable
GEMINI_API_KEY=your_key node test-gemini-simple.js

# Or as parameter
node test-gemini-simple.js your_key
```

### Step 4: Restart Application

```bash
npm run dev
```

## API Key Format Comparison

| Service Type | Prefix | Example | Status |
|-------------|--------|---------|--------|
| Gemini API | `AIza` | `AIzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs` | ✅ Correct |
| Google Maps | `IzaSy` | `IzaSyBOUOsNR1556Rmm5c2PlZyrtlBIlCpIWMs` | ❌ Wrong |

## Common Issues and Solutions

### Issue 1: "API key not valid"
**Solution**: Ensure you're using a Gemini API key, not a Google Maps API key

### Issue 2: "API key format incorrect"
**Solution**: Check that the key starts with `AIza` and is 39 characters long

### Issue 3: "No API key provided"
**Solution**: Configure the API key in environment variables or local storage

### Issue 4: "Insufficient quota"
**Solution**: Check API usage limits in Google AI Studio

## Verification Checklist

- [ ] API key starts with `AIza`
- [ ] API key is 39 characters long
- [ ] API key is configured in environment variables or local storage
- [ ] Test script runs successfully
- [ ] Application starts without errors
- [ ] AI recommendations are generated

## Fallback Solution

If unable to obtain Gemini API key, the application will automatically use fallback recommendation generation based on rule-based analysis to ensure functionality is always available.

## Support

If you continue to experience issues:
1. Check API key format and permissions
2. Verify network connectivity
3. Check browser console for detailed error messages
4. Run test script to validate API key
5. Contact support with error details 
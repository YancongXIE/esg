# PDF Processing and Analysis Testing Guide

## Quick Testing Steps

### 1. Start Application
```bash
npm run dev
```

### 2. Access Dashboard
Open browser and navigate to `http://localhost:5173` and go to the dashboard page.

### 3. Prepare Test Files
Test files have been copied to the `public/` directory:
- `test.pdf` - Sustainability report
- `S2.json` - Metrics file (optional)

### 4. Test File Upload
1. In the "Inputs" section
2. Click "Upload Report" to upload `test.pdf`
3. **Optional**: Click "Upload Metrics" to upload `S2.json` (optional)

### 5. Verify Report
1. Ensure PDF report is uploaded
2. Click "Verify Report" button
3. Wait for processing to complete (may take a few minutes)

### 6. View Results
- Check if Summary cards display compliance rates for each ESG category
- Check if Details table displays analysis results
- Check if AI Recommendations generate suggestions

## Focus Areas for Testing

### ✅ PDF Processing
- File upload functionality
- PDF to base64 conversion
- Server communication
- Response handling

### ✅ ESG Analysis
- Data parsing from server response
- Compliance rate calculations
- Greenwashing risk assessment
- Category-wise analysis

### ✅ Optional Metrics Upload
- Built-in standard criteria (always included)
- Optional custom metrics upload
- Criteria merging functionality
- UI state management

### ✅ UI Display
- Summary cards with compliance rates
- Details table with ESG criteria
- Filtering functionality
- Data visualization

### ✅ AI Recommendations (Enabled)
- AI-powered recommendation generation
- Fallback to rule-based recommendations if LLM unavailable
- Interactive recommendation details
- Priority and category classification

## Testing Scenarios

### Scenario 1: PDF Only (Standard Criteria)
1. Upload only `test.pdf`
2. Leave metrics upload empty
3. Click "Verify Report"
4. **Expected**: Uses built-in standard criteria only

### Scenario 2: PDF + Custom Metrics
1. Upload `test.pdf`
2. Upload `S2.json` in the metrics section
3. Click "Verify Report"
4. **Expected**: Merges built-in standard criteria with custom metrics

### Scenario 3: Custom Metrics Override
1. Upload `test.pdf`
2. Upload a custom JSON with both `standard` and `metric` sections
3. Click "Verify Report"
4. **Expected**: Custom standard criteria overrides built-in, custom metrics added

## Expected Results

### Successful Cases
- File upload successful, showing file name and size
- "Verify Report" button changes to "Verifying..." and shows loading animation
- Analysis results displayed after processing
- Summary cards display compliance rates for each ESG category
- Details table displays detailed ESG standard analysis
- AI Recommendations generate personalized suggestions

### Possible Error Cases
1. **File Upload Error**: Ensure PDF report is uploaded
2. **Network Timeout Error**: Server response time is too long
3. **Server Connection Error**: Server may be temporarily unavailable
4. **File Format Error**: Ensure correct file format
5. **AI Service Error**: LLM may be unavailable, will fallback to rule-based recommendations

## Debugging Tips

### 1. Browser Developer Tools
- Open F12 developer tools
- Check Console tab for error messages
- Check Network tab for request status

### 2. Common Error Messages
- `"Please upload a PDF report"` - PDF not uploaded
- `"Request timeout"` - Server response timeout
- `"Connection reset by peer"` - Server connection issue
- `"Invalid JSON file"` - JSON file format error

### 3. Network Troubleshooting
- Check network connection
- Confirm if server `https://3.25.57.106` is accessible
- Try pinging the server address

## Test Data Description

### test.pdf
- Contains content of Team Global Express's sustainability report
- Includes information on environmental, social, and governance aspects
- Includes greenhouse gas emissions, waste management, etc.

### S2.json (Optional)
- Contains AASB S2 standard metric definitions
- Covers environmental, social, and governance dimensions
- Includes specific ESG standards and evaluation standards

## Performance Considerations

1. **File Size**: test.pdf is approximately 127KB, processing time is 30 seconds to several minutes
2. **Network Latency**: Depending on network conditions, upload and processing times may differ
3. **Server Load**: Server may require longer processing time when busy
4. **Browser Compatibility**: It is recommended to use the latest versions of Chrome, Firefox, or Safari

## Troubleshooting

### If verification fails
1. Check if PDF report is uploaded correctly
2. Check network connection
3. Retry after a few minutes
4. Check browser console error messages

### If results do not display
1. Check for JavaScript errors
2. Refresh the page and try again
3. Clear browser cache
4. Check if the API service is working correctly

### If upload button does not work
1. Check file format
2. Ensure reasonable file size
3. Check if browser supports File API
4. Try using a different browser

## Testing Checklist

- [ ] PDF report upload works
- [ ] Metrics upload works (optional)
- [ ] Built-in standard criteria is always included
- [ ] Custom metrics merge correctly with standard criteria
- [ ] "Verify Report" button triggers processing
- [ ] Loading animation displays during processing
- [ ] Summary cards show compliance rates
- [ ] Details table displays ESG criteria analysis
- [ ] Filtering works for categories, criteria, and results
- [ ] AI Recommendations generate suggestions
- [ ] AI fallback works when LLM is unavailable
- [ ] Error handling works for various failure scenarios 
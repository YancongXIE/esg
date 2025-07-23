# ESG Dashboard API Integration Features

## Feature Overview

This dashboard now integrates API functionality, allowing users to upload sustainability reports (PDF format) and metrics files (JSON format), then send them to the server for analysis and display results in the dashboard.

## Main Features

### 1. File Upload
- **Sustainability Report**: Supports PDF, DOC, DOCX, TXT formats
- **Metrics File**: Supports JSON format (e.g., S2.json)

### 2. Report Verification
- Click "Verify Report" button to send files to server
- Server returns analysis results
- Results automatically displayed in Summary and Details sections

### 3. Results Display
- **Summary Cards**: Display compliance rates for each ESG category
- **Details Table**: Display detailed ESG standards analysis results
- **Recommendations**: Generate improvement recommendations based on analysis results

## Usage Instructions

### 1. Prepare Files
- Prepare a sustainability report PDF file (e.g., test.pdf)
- Prepare a metrics JSON file (e.g., S2.json)

### 2. Upload Files
1. In the dashboard's "Inputs" section
2. Click "Upload Report" to upload PDF file
3. Click "Upload Metrics" to upload JSON file

### 3. Verify Report
1. Ensure both files are uploaded
2. Click "Verify Report" button
3. Wait for server processing (may take several minutes)

### 4. View Results
- After processing is complete, results will automatically display in Summary and Details sections
- View compliance rates for each ESG category
- View detailed ESG standards analysis results

## Technical Implementation

### API Service (`src/dashboard/services/apiService.js`)
- `sendReportToServer()`: Send files to server
- `fileToBase64()`: Convert PDF file to base64 encoding
- `readJsonFile()`: Read JSON file content

### Component Updates (`src/dashboard/components/SYDashboardContent.jsx`)
- Added file upload functionality
- Added verification button and state management
- Integrated API calls and result processing
- Added error handling and loading states

### Server Configuration
- Server URL: `https://3.25.57.106/dashboard_process`
- Request timeout: 5 minutes
- Supported file formats: PDF + JSON

## Error Handling

### Common Errors
1. **Files not uploaded**: Ensure both PDF and JSON files are uploaded
2. **Network timeout**: Server response time too long, will automatically timeout
3. **Server error**: Server may be temporarily unavailable
4. **File format error**: Ensure file formats are correct

### Error Messages
- Verification errors will display on the page
- Network errors will show specific error messages
- Timeout errors will prompt to retry

## Important Notes

1. **File size**: Large files may require longer processing time
2. **Network connection**: Ensure stable network connection
3. **Server status**: Server may be unavailable at times
4. **File format**: Ensure file formats are correct and content is valid

## Development Notes

### Local Testing
1. Start development server: `npm run dev`
2. Access dashboard page
3. Upload test files for verification

### Debugging
- Open browser developer tools to view console logs
- Check network request status and responses
- View error messages and stack traces

## Future Improvements

1. **File validation**: Add file format and content validation
2. **Progress display**: Show file upload and processing progress
3. **Result caching**: Cache analysis results to improve performance
4. **Batch processing**: Support simultaneous processing of multiple files
5. **Export functionality**: Support exporting analysis results as reports 
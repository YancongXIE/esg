# LLM Integration Setup Guide

## Google Gemini API Configuration

This application now includes AI-powered recommendations using Google's Gemini LLM. Follow these steps to set up the integration:

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure API Key

#### Option A: Environment Variable (Recommended)
Create a `.env` file in the project root and add:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

#### Option B: Browser Local Storage
Open browser console and run:
```javascript
localStorage.setItem('GEMINI_API_KEY', 'your_actual_api_key_here');
```

### 3. Restart Application
After setting the API key, restart your development server:
```bash
npm run dev
```

## Features

### AI-Powered Recommendations
- **Automatic Analysis**: AI analyzes ESG compliance data and generates personalized recommendations
- **Structured Output**: Recommendations include problem description, suggestions, expected outcomes, and priority levels
- **Fallback System**: If LLM is unavailable, the system uses rule-based recommendations
- **Interactive UI**: Click "View Details" to see full recommendation information

### Recommendation Categories
- **Governance**: Board oversight, risk management, compliance
- **Environment**: Climate impact, resource management, sustainability
- **Social**: Employee welfare, community impact, stakeholder relations

### Priority Levels
- **High**: Critical issues requiring immediate attention
- **Medium**: Important improvements for better performance
- **Low**: Optional enhancements for excellence

## API Usage

The LLM service processes ESG data and generates recommendations with the following structure:

```json
{
  "recommendations": [
    {
      "title": "Recommendation Title",
      "problem": "Problem Description",
      "suggestion": "Specific Suggestion",
      "expectedOutcome": "Expected Outcome",
      "priority": "High/Medium/Low",
      "category": "Governance/Environment/Social"
    }
  ],
  "summary": {
    "totalRecommendations": 3,
    "highPriorityCount": 1,
    "overallAssessment": "Overall Assessment Summary"
  }
}
```

## Troubleshooting

### API Key Issues
- Ensure the API key is correctly set
- Check that the key has proper permissions
- Verify the key is not expired

### Network Issues
- Check internet connectivity
- Ensure no firewall is blocking the request
- Verify the API endpoint is accessible

### Fallback Mode
If LLM is unavailable, the system automatically switches to rule-based recommendations based on:
- Overall compliance rate
- Greenwashing risk percentage
- Specific ESG category performance

## Security Notes

- Never commit API keys to version control
- Use environment variables for production deployments
- Regularly rotate API keys for security
- Monitor API usage to avoid rate limits

## Cost Considerations

- Gemini API has usage-based pricing
- Monitor your usage in Google AI Studio
- Set up billing alerts to avoid unexpected charges
- Consider implementing rate limiting for production use 
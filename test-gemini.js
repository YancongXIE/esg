// Independent Gemini API test file
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Test ESG data
const testESGData = {
  "Environment": {
    "Climate Change": {
      "GHG emissions disclosure": ["Yes", ""],
      "Climate risk assessment": ["No", "Lack of detailed climate risk assessment"],
      "Carbon reduction targets": ["Partial", "Targets not specific enough"]
    },
    "Resource Management": {
      "Water usage tracking": ["Yes", ""],
      "Waste management": ["Yes", ""],
      "Energy efficiency": ["No", "Energy efficiency data incomplete"]
    }
  },
  "Social": {
    "Labor Rights": {
      "Employee safety": ["Yes", ""],
      "Fair wages": ["Yes", ""],
      "Workplace diversity": ["Partial", "Diversity data needs improvement"]
    }
  },
  "Governance": {
    "Board Oversight": {
      "ESG committee": ["Yes", ""],
      "Risk management": ["No", "Risk management framework incomplete"],
      "Stakeholder engagement": ["Partial", "Stakeholder engagement needs improvement"]
    }
  }
};

// Test compliance data
const testComplianceData = {
  overall: {
    complianceRate: 65,
    greenwashingRisk: 18
  }
};

// Build ESG analysis prompt
const buildESGPrompt = (esgData, complianceData) => {
  const { complianceRate, greenwashingRisk } = complianceData.overall;
  
  // Process ESG data, extract key information
  const processedData = processESGDataForLLM(esgData);
  
  return `You are a professional ESG (Environmental, Social, and Governance) analyst. Please provide specific, actionable improvement recommendations based on the following sustainability report analysis results.

IMPORTANT: All output must be in ENGLISH ONLY. Do not use any other languages in your response.

## Analysis Background
- Overall compliance rate: ${complianceRate}%
- Greenwashing risk: ${greenwashingRisk}%

## ESG Analysis Data
${processedData}

## Task Requirements
Please provide 3-5 specific, actionable improvement recommendations. Each recommendation should include:
1. **Recommendation Title** - Concise and clear title in English
2. **Problem Description** - Current issues or areas for improvement (in English)
3. **Specific Recommendations** - Detailed actionable suggestions (in English)
4. **Expected Outcomes** - Potential improvements after implementation (in English)
5. **Priority Level** - High/Medium/Low priority

## Output Format
Please return in JSON format with the following structure. ALL TEXT MUST BE IN ENGLISH:
{
  "recommendations": [
    {
      "title": "Recommendation Title in English",
      "problem": "Problem Description in English",
      "suggestion": "Specific Recommendations in English",
      "expectedOutcome": "Expected Outcomes in English",
      "priority": "High/Medium/Low",
      "category": "Governance/Environment/Social"
    }
  ],
  "summary": {
    "totalRecommendations": number,
    "highPriorityCount": high priority count,
    "overallAssessment": "Overall assessment summary in English"
  }
}

CRITICAL: Ensure ALL text fields contain only English text. Do not include any Chinese characters or other languages in the response.

Please ensure recommendations are specific, practical, and address the specific issues in the analysis data.`;
};

// Process ESG data, extract key information for LLM analysis
const processESGDataForLLM = (esgData) => {
  let analysis = '';
  
  Object.keys(esgData).forEach(category => {
    const categoryData = esgData[category];
    analysis += `\n### ${category.toUpperCase()} CATEGORY\n`;
    
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
      let compliantCount = 0;
      let totalCount = 0;
      const issues = [];
      
      Object.keys(subCategoryData).forEach(criterion => {
        const [result, details] = subCategoryData[criterion];
        totalCount++;
        
        if (result.toLowerCase() === 'yes') {
          compliantCount++;
        } else {
          issues.push(`- ${criterion}: ${result} (${details || 'No detailed information'})`);
        }
      });
      
      const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;
      analysis += `\n**${subCategory}**: ${compliantCount}/${totalCount} compliant (${complianceRate}%)\n`;
      
      if (issues.length > 0) {
        analysis += `**Main Issues**:\n${issues.join('\n')}\n`;
      }
    });
  });
  
  return analysis;
};

// Test Gemini API call
const testGeminiAPI = async (apiKey) => {
  try {
    console.log('Starting Gemini API test...');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not provided');
    
    const prompt = buildESGPrompt(testESGData, testComplianceData);
    console.log('Generated prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 200) + '...');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('AI response text:', responseText);
      
      // Try to parse JSON response
      try {
        // Clean response text, remove possible markdown code block wrapper
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedResponse = JSON.parse(cleanText);
        
        console.log('Parsed JSON:', JSON.stringify(parsedResponse, null, 2));
        return {
          success: true,
          data: parsedResponse
        };
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        // If JSON parsing fails, return the response text as is
        return {
          success: true,
          data: {
            recommendations: [{
              title: "AI Generated Recommendations",
              problem: "Unable to parse structured data",
              suggestion: responseText,
              expectedOutcome: "Please review the recommendation content",
              priority: "Medium",
              category: "General"
            }],
            summary: {
              totalRecommendations: 1,
              highPriorityCount: 0,
              overallAssessment: "AI has generated recommendations, but format needs optimization"
            }
          }
        };
      }
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run test
const runTest = async () => {
  // Get API key from environment variable or command line argument
  const apiKey = process.env.GEMINI_API_KEY || process.argv[2];
  
  if (!apiKey) {
    console.error('Please provide Gemini API key:');
    console.error('Method 1: Set environment variable GEMINI_API_KEY=your_key');
    console.error('Method 2: As command line argument: node test-gemini.js your_key');
    process.exit(1);
  }
  
  console.log('=== Gemini API Test Start ===');
  const result = await testGeminiAPI(apiKey);
  
  if (result.success) {
    console.log('✅ Test successful!');
    console.log('Recommendation count:', result.data.recommendations?.length || 0);
  } else {
    console.log('❌ Test failed:', result.error);
  }
  
  console.log('=== Test Complete ===');
};

// If this file is run directly, execute the test
if (require.main === module) {
  runTest();
}

module.exports = { testGeminiAPI, buildESGPrompt, processESGDataForLLM }; 
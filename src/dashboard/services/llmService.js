// LLM Service for Google Gemini API integration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Validate API key format
const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return { valid: false, error: 'API key not provided' };
  }
  
  if (apiKey.length < 30) {
    return { valid: false, error: 'API key too short, may be invalid' };
  }
  
  if (!apiKey.startsWith('AIza')) {
    return { valid: false, error: 'API key format incorrect, should start with "AIza". Please ensure you are using a Gemini API key, not a key for other Google services.' };
  }
  
  return { valid: true };
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

// Call Gemini API
export const generateLLMRecommendations = async (esgData, complianceData, apiKey) => {
  try {
    // First validate API key
    const keyValidation = validateApiKey(apiKey);
    if (!keyValidation.valid) {
      return {
        success: false,
        error: keyValidation.error
      };
    }

    const prompt = buildESGPrompt(esgData, complianceData);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.details) {
          const apiKeyError = errorData.error.details.find(detail => 
            detail.reason === 'API_KEY_INVALID'
          );
          
          if (apiKeyError) {
            errorMessage = 'API key invalid. Please ensure you are using the correct Gemini API key (starting with "AIza") and that the key has access to Gemini API.';
          } else if (errorData.error.message) {
            errorMessage = `API error: ${errorData.error.message}`;
          }
        }
      } catch (e) {
        // If unable to parse error details, use default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      
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
        
        return {
          success: true,
          data: parsedResponse
        };
      } catch (parseError) {
        // If JSON parsing fails, clean the response text and return formatted text
        const cleanedResponseText = responseText; // No longer need to clean mixed language responses
        return {
          success: true,
          data: {
            recommendations: [{
              title: "AI Generated Recommendations",
              problem: "Unable to parse structured data",
              suggestion: cleanedResponseText,
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
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fallback recommendation generation (when LLM is unavailable)
export const generateFallbackRecommendations = (complianceData) => {
  const { complianceRate, greenwashingRisk } = complianceData.overall;
  
  const recommendations = [];
  
  if (complianceRate < 70) {
    recommendations.push({
      title: "Improve Overall Compliance Rate",
      problem: `Current compliance rate is only ${complianceRate}%, below industry standards`,
      suggestion: "Prioritize ESG categories with the lowest scores and develop detailed improvement plans and timelines",
      expectedOutcome: "Expected to increase compliance rate to above 80%",
      priority: "High",
      category: "Governance"
    });
  }
  
  if (greenwashingRisk > 15) {
    recommendations.push({
      title: "Reduce Greenwashing Risk",
      problem: `Greenwashing risk is ${greenwashingRisk}%, requiring focused attention`,
      suggestion: "Strengthen transparency and accuracy of information disclosure, avoid exaggerating environmental achievements",
      expectedOutcome: "Reduce greenwashing risk to below 10%",
      priority: "High",
      category: "Environment"
    });
  }
  
  if (complianceRate >= 70 && greenwashingRisk <= 15) {
    recommendations.push({
      title: "Maintain High Standards",
      problem: "Current performance is good, but there is still room for improvement",
      suggestion: "Continue maintaining current standards and seek breakthrough improvements in specific areas",
      expectedOutcome: "Consolidate industry leadership position",
      priority: "Medium",
      category: "General"
    });
  }
  
  return {
    success: true,
    data: {
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highPriorityCount: recommendations.filter(r => r.priority === "High").length,
        overallAssessment: "Recommendations generated based on compliance data analysis"
      }
    }
  };
}; 
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
  
  // 检测涉及的标准
  const standardsInvolved = [];
  if (esgData.gri) standardsInvolved.push('GRI (Global Reporting Initiative)');
  if (esgData.s2) standardsInvolved.push('AASB S2 (Climate-related Financial Disclosures)');
  if (esgData.s3 && !esgData.s3.error) standardsInvolved.push('AASB S3 (Scope 3 Emissions)');
  const standardsText = standardsInvolved.length > 0 
    ? `The analysis covers the following ESG standards: ${standardsInvolved.join(', ')}.`
    : 'The analysis covers multiple ESG standards.';
  
  return `You are a professional ESG (Environmental, Social, and Governance) analyst. Please provide specific, actionable improvement recommendations based on the following sustainability report analysis results.

${standardsText}

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
// 支持两种数据格式：
// 1. 原始标准数据：{ gri: {...}, s2: {...}, s3: {...} }
// 2. 归一化数据：{ category: { subCategory: { criterion: [...] } } }
const processESGDataForLLM = (esgData) => {
  let analysis = '';
  
  // 检查是否是原始标准数据格式（包含 gri, s2, s3 键）
  const isRawStandardsFormat = esgData.gri !== undefined || esgData.s2 !== undefined || esgData.s3 !== undefined;
  
  if (isRawStandardsFormat) {
    // 处理原始标准数据格式
    analysis += '# ESG STANDARDS ANALYSIS\n\n';
    
    // 处理 GRI 数据
    if (esgData.gri && typeof esgData.gri === 'object') {
      analysis += '## GRI (Global Reporting Initiative) Standards\n\n';
      analysis += processStandardData(esgData.gri, 'GRI');
    }
    
    // 处理 S2 数据
    if (esgData.s2 && typeof esgData.s2 === 'object') {
      analysis += '\n## AASB S2 (Climate-related Financial Disclosures) Standards\n\n';
      analysis += processStandardData(esgData.s2, 'AASB S2');
    }
    
    // 处理 S3 数据（如果有且没有错误）
    if (esgData.s3 && typeof esgData.s3 === 'object' && !esgData.s3.error) {
      analysis += '\n## AASB S3 (Scope 3 Emissions) Standards\n\n';
      analysis += processStandardData(esgData.s3, 'AASB S3');
    }
  } else {
    // 处理归一化数据格式
  Object.keys(esgData).forEach(category => {
    const categoryData = esgData[category];
      if (!categoryData || typeof categoryData !== 'object') return;
      
    analysis += `\n### ${category.toUpperCase()} CATEGORY\n`;
    
    Object.keys(categoryData).forEach(subCategory => {
      const subCategoryData = categoryData[subCategory];
        if (!subCategoryData || typeof subCategoryData !== 'object') return;
        
      let compliantCount = 0;
      let totalCount = 0;
      const issues = [];
      
      Object.keys(subCategoryData).forEach(criterion => {
          const raw = subCategoryData[criterion];
          const parsed = parseCriterionData(raw, criterion);
          
          if (!parsed || parsed.result === undefined || parsed.result === null) {
            return;
          }

          const resultStr = typeof parsed.result === 'string' ? parsed.result : String(parsed.result);
        totalCount++;
        
          if (resultStr.toLowerCase() === 'yes' || resultStr.toLowerCase() === 'few') {
          compliantCount++;
        } else {
            const label = parsed.criteriaName || criterion;
            issues.push(`- ${label}: ${resultStr} (${parsed.details || 'No detailed information'})`);
        }
      });
      
      const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;
      analysis += `\n**${subCategory}**: ${compliantCount}/${totalCount} compliant (${complianceRate}%)\n`;
      
      if (issues.length > 0) {
        analysis += `**Main Issues**:\n${issues.join('\n')}\n`;
      }
    });
    });
  }
  
  return analysis;
};

// 处理标准数据（GRI、S2、S3 的原始格式）
const processStandardData = (standardData, standardName) => {
  let analysis = '';
  
  Object.keys(standardData).forEach(categoryName => {
    const categoryData = standardData[categoryName];
    if (!categoryData || typeof categoryData !== 'object') return;
    
    analysis += `### ${categoryName}\n`;
    
    let compliantCount = 0;
    let totalCount = 0;
    const issues = [];
    
    // S2 数据是数组格式
    if (Array.isArray(categoryData)) {
      categoryData.forEach((item, idx) => {
        if (!Array.isArray(item) || item.length === 0) return;
        
        const first = item[0];
        if (!Array.isArray(first) || first.length < 2) return;
        
        const [criteriaName, result, details = ''] = first;
        if (!criteriaName || result === undefined || result === null) return;
        
        const resultStr = typeof result === 'string' ? result : String(result);
        totalCount++;
        
        if (resultStr.toLowerCase() === 'yes' || resultStr.toLowerCase() === 'few') {
          compliantCount++;
        } else {
          issues.push(`- ${criteriaName}: ${resultStr} (${details || 'No detailed information'})`);
        }
      });
    } else {
      // GRI 数据是嵌套对象格式
      Object.keys(categoryData).forEach(subCategoryName => {
        const subCategoryData = categoryData[subCategoryName];
        if (!subCategoryData || typeof subCategoryData !== 'object') return;
        
        Object.keys(subCategoryData).forEach(criterionKey => {
          const criterionData = subCategoryData[criterionKey];
          const parsed = parseCriterionData(criterionData, criterionKey);
          
          if (!parsed || parsed.result === undefined || parsed.result === null) {
            return;
          }
          
          const resultStr = typeof parsed.result === 'string' ? parsed.result : String(parsed.result);
          totalCount++;
          
          if (resultStr.toLowerCase() === 'yes' || resultStr.toLowerCase() === 'few') {
            compliantCount++;
          } else {
            const label = parsed.criteriaName || criterionKey;
            issues.push(`- ${label}: ${resultStr} (${parsed.details || 'No detailed information'})`);
          }
        });
      });
    }
    
    const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;
    analysis += `**Compliance**: ${compliantCount}/${totalCount} compliant (${complianceRate}%)\n`;
    
    if (issues.length > 0) {
      analysis += `**Main Issues**:\n${issues.join('\n')}\n`;
    }
    
    analysis += '\n';
  });
  
  return analysis;
};

// 解析准则数据（支持多种格式）
const parseCriterionData = (raw, defaultKey) => {
  let criteriaName;
  let result;
  let details;

  if (Array.isArray(raw)) {
    if (raw.length >= 4) {
      [criteriaName, result, details] = raw;
    } else if (raw.length === 2) {
      [result, details] = raw;
      criteriaName = defaultKey;
    } else {
      result = raw[0];
      details = raw[1] || '';
      criteriaName = defaultKey;
    }
  } else if (raw && typeof raw === 'object') {
    result = raw.compliance || raw.result;
    details = raw.text || raw.details;
    criteriaName = raw.criteriaName || defaultKey;
  } else {
    result = raw;
    details = '';
    criteriaName = defaultKey;
  }

  return { criteriaName, result, details };
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
      let errorMessage = `Gemini API error: ${response.status} (${response.statusText})`;
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          // Handle 403 Forbidden errors with detailed messages
          if (response.status === 403) {
            const errorMsg = errorData.error.message || '';
            
            if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid') || errorMsg.includes('API key')) {
              errorMessage = 'API key invalid or expired. Please check your Gemini API key in the .env file (VITE_GEMINI_API_KEY) or localStorage. Using rule-based recommendations.';
            } else if (errorMsg.includes('quota') || errorMsg.includes('Quota') || errorMsg.includes('exceeded')) {
              errorMessage = 'API quota exceeded. The free tier limit has been reached. Please enable billing or wait for quota reset. Using rule-based recommendations.';
            } else if (errorMsg.includes('billing') || errorMsg.includes('Billing')) {
              errorMessage = 'Billing not enabled. Please enable billing for your Google Cloud project to use the Gemini API. Using rule-based recommendations.';
            } else if (errorMsg.includes('permission') || errorMsg.includes('Permission') || errorMsg.includes('denied')) {
              errorMessage = 'Permission denied. The API key does not have access to the Gemini API. Please check API key permissions. Using rule-based recommendations.';
            } else {
              errorMessage = `API access denied (403): ${errorMsg || 'Please check your API key configuration and permissions.'} Using rule-based recommendations.`;
            }
          } else if (errorData.error && errorData.error.details) {
          const apiKeyError = errorData.error.details.find(detail => 
            detail.reason === 'API_KEY_INVALID'
          );
          
          if (apiKeyError) {
            errorMessage = 'API key invalid. Please ensure you are using the correct Gemini API key (starting with "AIza") and that the key has access to Gemini API.';
          } else if (errorData.error.message) {
              errorMessage = `API error: ${errorData.error.message}`;
            }
          } else if (errorData.error && errorData.error.message) {
            errorMessage = `API error: ${errorData.error.message}`;
          }
        }
      } catch (e) {
        // If unable to parse error details, provide helpful message for 403
        if (response.status === 403) {
          errorMessage = 'API access denied (403). Possible reasons: invalid API key, quota exceeded, or billing not enabled. Please check your Gemini API key configuration.';
        }
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